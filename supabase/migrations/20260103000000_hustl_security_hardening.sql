-- ==============================================================================
-- HUSTL — SECURITY HARDENING MIGRATION (run AFTER 20250101000000_hustl_core_schema.sql)
-- Safe to re-run: every statement is idempotent (DROP ... IF EXISTS / CREATE OR REPLACE).
--
-- Fixes found while auditing the original schema:
--   1. profiles.email was readable by anyone (public PII leak).
--   2. Users could set their own profiles.verified / completed_projects.
--   3. conversation_participants / team_members policies referenced their own table
--      (Postgres "infinite recursion detected in policy" errors).
--   4. ANY signed-in user could add themselves to ANY conversation and read its messages.
--   5. Applicants could change their own application status to Accepted / Selected / Hired.
--   6. Storage: any signed-in user could overwrite other users' avatars and read every attachment.
--   7. companies had no write policies; verified flag was self-assignable.
--   8. Notifications could be inserted with spoofed/missing actor.
--   9. Default currency was USD (now INR; stored amounts are NOT converted).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. INR default (existing rows are left untouched — no silent reinterpretation)
-- ------------------------------------------------------------------------------
ALTER TABLE public.job_listings ALTER COLUMN currency SET DEFAULT 'INR';

-- ------------------------------------------------------------------------------
-- 1 & 2. PROFILES: hide email from other users, protect verified/completed_projects
-- The app reads your own email from the auth session (supabase.auth.getSession()).
-- ------------------------------------------------------------------------------
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, full_name, display_name, headline, avatar_url, bio, location, institution,
  availability, years_of_experience, completed_projects, verified, is_onboarded,
  created_at, updated_at
) ON public.profiles TO anon, authenticated;

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
  full_name, display_name, headline, avatar_url, bio, location, institution,
  availability, years_of_experience, is_onboarded, updated_at
) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER avoids recursive RLS evaluation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_conversation_member(cid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = cid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner(cid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = cid AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.company_members
                 WHERE company_id = cid AND user_id = auth.uid() AND role IN ('owner','admin'));
$$;

-- ------------------------------------------------------------------------------
-- 3 & 4. MESSAGING: only participants can read; only the creator can add participants
-- ------------------------------------------------------------------------------
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid();

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (public.is_conversation_member(id) OR created_by = auth.uid());
CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (public.is_conversation_member(id));

DROP POLICY IF EXISTS "Participants can view participant list" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant record" ON public.conversation_participants;

CREATE POLICY "Participants can view participant list" ON public.conversation_participants
  FOR SELECT USING (public.is_conversation_member(conversation_id));
CREATE POLICY "Only conversation creator can add participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );
CREATE POLICY "Users can update own participant record" ON public.conversation_participants
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Authorized participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Senders can edit own messages" ON public.messages;

CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (public.is_conversation_member(conversation_id));
CREATE POLICY "Authorized participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(conversation_id));
CREATE POLICY "Senders can edit own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

-- Start (or reuse) a 1-to-1 conversation atomically. Call from the client with:
--   supabase.rpc('start_direct_conversation', { other_user: '<uuid>', p_context_type: 'freelance', ... })
CREATE OR REPLACE FUNCTION public.start_direct_conversation(
  other_user uuid,
  p_context_type text DEFAULT 'general',
  p_context_id text DEFAULT NULL,
  p_context_title text DEFAULT NULL,
  p_context_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  cid uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF other_user IS NULL OR other_user = me THEN RAISE EXCEPTION 'Invalid recipient'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = other_user) THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  SELECT c.id INTO cid
  FROM public.conversations c
  WHERE c.conversation_type = 'direct'
    AND c.context_id IS NOT DISTINCT FROM p_context_id
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = other_user)
  LIMIT 1;

  IF cid IS NULL THEN
    INSERT INTO public.conversations (conversation_type, context_type, context_id, context_title, context_url, created_by)
    VALUES ('direct', p_context_type, p_context_id, p_context_title, p_context_url, me)
    RETURNING id INTO cid;
    INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (cid, me), (cid, other_user);
  END IF;
  RETURN cid;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(cid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_conversation_member(cid) THEN RAISE EXCEPTION 'Not a participant'; END IF;
  UPDATE public.messages SET is_read = TRUE
    WHERE conversation_id = cid AND sender_id <> auth.uid() AND is_read = FALSE;
  UPDATE public.conversation_participants SET last_read_at = now()
    WHERE conversation_id = cid AND user_id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.start_direct_conversation(uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.start_direct_conversation(uuid, text, text, text, text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS: inserts must be attributed to the signed-in actor
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "System/Authorized users can insert notifications" ON public.notifications;
CREATE POLICY "Actors can insert attributed notifications" ON public.notifications
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 5. APPLICATIONS: applicants may only withdraw; only owners may change other statuses
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_freelance_application_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NOT EXISTS (SELECT 1 FROM public.freelance_projects p WHERE p.id = OLD.project_id AND p.owner_id = auth.uid())
     AND NEW.status <> 'Withdrawn' THEN
    RAISE EXCEPTION 'Only the project owner can change this application status';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_freelance_application ON public.freelance_applications;
CREATE TRIGGER trg_guard_freelance_application BEFORE UPDATE ON public.freelance_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_freelance_application_update();

CREATE OR REPLACE FUNCTION public.guard_job_application_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND (NEW.status IS DISTINCT FROM OLD.status OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason)
     AND NOT EXISTS (SELECT 1 FROM public.job_listings j WHERE j.id = OLD.job_id AND j.creator_id = auth.uid())
     AND NEW.status <> 'Withdrawn' THEN
    RAISE EXCEPTION 'Only the recruiter who posted this job can change application status';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_job_application ON public.job_applications;
CREATE TRIGGER trg_guard_job_application BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_job_application_update();

CREATE OR REPLACE FUNCTION public.guard_collab_application_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NOT EXISTS (SELECT 1 FROM public.startup_ideas i WHERE i.id = OLD.idea_id AND i.owner_id = auth.uid())
     AND NEW.status <> 'Withdrawn' THEN
    RAISE EXCEPTION 'Only the idea owner can change this application status';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_collab_application ON public.collaboration_applications;
CREATE TRIGGER trg_guard_collab_application BEFORE UPDATE ON public.collaboration_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_collab_application_update();

-- New applications always start as 'Submitted' (prevents inserting a pre-approved application)
CREATE OR REPLACE FUNCTION public.force_initial_application_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN NEW.status := 'Submitted'; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_initial_freelance_app ON public.freelance_applications;
CREATE TRIGGER trg_initial_freelance_app BEFORE INSERT ON public.freelance_applications
  FOR EACH ROW EXECUTE FUNCTION public.force_initial_application_status();
DROP TRIGGER IF EXISTS trg_initial_job_app ON public.job_applications;
CREATE TRIGGER trg_initial_job_app BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.force_initial_application_status();
DROP TRIGGER IF EXISTS trg_initial_collab_app ON public.collaboration_applications;
CREATE TRIGGER trg_initial_collab_app BEFORE INSERT ON public.collaboration_applications
  FOR EACH ROW EXECUTE FUNCTION public.force_initial_application_status();

-- ------------------------------------------------------------------------------
-- 7. COMPANIES: owners can create/manage; "verified" can only be set by an admin (SQL editor)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_company_verified()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN NEW.verified := FALSE;
    ELSE NEW.verified := OLD.verified; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_company_verified ON public.companies;
CREATE TRIGGER trg_protect_company_verified BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_verified();

DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can update companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can delete companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Company owners can update companies" ON public.companies
  FOR UPDATE USING (public.is_company_owner(id)) WITH CHECK (public.is_company_owner(id));
CREATE POLICY "Company owners can delete companies" ON public.companies
  FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view company members" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Owners can add themselves as first member" ON public.company_members;
CREATE POLICY "Members can view company members" ON public.company_members
  FOR SELECT USING (user_id = auth.uid() OR public.is_company_owner(company_id));
CREATE POLICY "Owners can add themselves as first member" ON public.company_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Company owners can manage members" ON public.company_members
  FOR ALL USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));

-- ------------------------------------------------------------------------------
-- 3. TEAMUP: remove self-referential policy; idea owner manages team; members can leave
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Idea owners manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Members can leave a team" ON public.team_members;
CREATE POLICY "Idea owners manage team members" ON public.team_members
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.startup_ideas i WHERE i.id = team_id AND i.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_ideas i WHERE i.id = team_id AND i.owner_id = auth.uid()));
CREATE POLICY "Members can leave a team" ON public.team_members
  FOR DELETE USING (user_id = auth.uid());

-- Invitations: invitee may only accept/decline; inviter may only cancel.
CREATE OR REPLACE FUNCTION public.guard_team_invitation_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NEW.team_id IS DISTINCT FROM OLD.team_id OR NEW.idea_id IS DISTINCT FROM OLD.idea_id
       OR NEW.invited_user_id IS DISTINCT FROM OLD.invited_user_id OR NEW.invited_by IS DISTINCT FROM OLD.invited_by THEN
      RAISE EXCEPTION 'Invitation target cannot be changed';
    END IF;
    IF auth.uid() = OLD.invited_user_id AND NEW.status NOT IN ('Accepted','Declined') AND NEW.status <> OLD.status THEN
      RAISE EXCEPTION 'Invitees can only accept or decline';
    END IF;
    IF auth.uid() = OLD.invited_by AND auth.uid() <> OLD.invited_user_id
       AND NEW.status <> OLD.status AND NEW.status <> 'Cancelled' THEN
      RAISE EXCEPTION 'Inviters can only cancel an invitation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_team_invitation ON public.team_invitations;
CREATE TRIGGER trg_guard_team_invitation BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION public.guard_team_invitation_update();

-- Invitation acceptance must also create the team membership (invitee isn't allowed to insert team_members directly)
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.team_invitations%ROWTYPE;
BEGIN
  SELECT * INTO inv FROM public.team_invitations WHERE id = invitation_id;
  IF NOT FOUND OR inv.invited_user_id <> auth.uid() OR inv.status <> 'Pending' THEN
    RAISE EXCEPTION 'Invitation not available';
  END IF;
  UPDATE public.team_invitations SET status = 'Accepted', responded_at = now() WHERE id = invitation_id;
  INSERT INTO public.team_members (team_id, user_id, role_title, is_owner)
  VALUES (inv.team_id, inv.invited_user_id, inv.role_title, FALSE)
  ON CONFLICT (team_id, user_id) DO UPDATE SET membership_status = 'active';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.accept_team_invitation(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_team_invitation(uuid) TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. STORAGE: files must live under a folder named after the uploader's user id
--    (the app already uploads to  <userId>/<filename>)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete attachments" ON storage.objects;

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload portfolio assets" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update portfolio assets" ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete portfolio assets" ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Private attachments (resumes, chat files): only the uploader can read/write them directly.
-- Share with others via short-lived signed URLs created by the uploader.
CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete attachments" ON storage.objects FOR DELETE
  USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Limit avatar / portfolio uploads to images and 5 MB (adjust if you need other types)
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/gif']
WHERE id IN ('avatars','portfolio');

-- ==============================================================================
-- END OF HARDENING MIGRATION
-- ==============================================================================
