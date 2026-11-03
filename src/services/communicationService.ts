import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Conversation, Message, NotificationItem, NotificationPreferences, NotificationCategory } from '../types';

export const communicationService = {
  /**
   * Fetch conversations involving a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data: participantData, error: pError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at, archived_at')
        .eq('user_id', userId);

      if (pError || !participantData || participantData.length === 0) return [];

      const conversationIds = participantData.map(p => p.conversation_id);

      const { data: convData, error: cError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (cError || !convData) return [];

      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('*, profiles(id, full_name, avatar_url, headline)')
        .in('conversation_id', conversationIds);

      return convData.map(row => {
        const parts = (allParticipants || []).filter(p => p.conversation_id === row.id);
        const myRecord = parts.find(p => p.user_id === userId);

        const mappedParticipants = parts.map(p => ({
          id: p.user_id,
          name: p.profiles?.full_name || 'Participant',
          avatarUrl: p.profiles?.avatar_url,
          headline: p.profiles?.headline,
        }));

        return {
          id: row.id,
          participantIds: parts.map(p => p.user_id),
          participants: mappedParticipants,
          lastMessageAt: row.last_message_at || row.created_at,
          conversationType: row.conversation_type || 'direct',
          contextType: row.context_type,
          contextId: row.context_id,
          contextTitle: row.context_title,
          contextSubtitle: row.context_subtitle,
          contextUrl: row.context_url,
          isArchived: Boolean(myRecord?.archived_at),
          unreadCount: 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });
    } catch (err) {
      console.warn('communicationService.getConversations exception:', err);
      return [];
    }
  },

  /**
   * Fetch messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: m.profiles?.full_name || 'User',
        senderAvatar: m.profiles?.avatar_url,
        body: m.body,
        createdAt: m.created_at,
        isRead: Boolean(m.is_read),
      }));
    } catch (err) {
      console.warn('communicationService.getMessages exception:', err);
      return [];
    }
  },

  /**
   * Send a new message
   */
  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<Message | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          body: message.body,
          is_read: false,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('communicationService.sendMessage error:', error);
        return null;
      }

      await supabase
        .from('conversations')
        .update({
          last_message_at: data.created_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.conversationId);

      return {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        body: data.body,
        createdAt: data.created_at,
        isRead: false,
      };
    } catch (err) {
      console.error('communicationService.sendMessage exception:', err);
      return null;
    }
  },

  /**
   * Subscribe to real-time incoming messages for a conversation
   */
  subscribeToConversationMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
    if (!isSupabaseConfigured || !supabase) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const m = payload.new;
          onNewMessage({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            senderName: 'User',
            body: m.body,
            createdAt: m.created_at,
            isRead: Boolean(m.is_read),
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase?.removeChannel(channel);
      },
    };
  },

  /**
   * Fetch notifications for a user
   */
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(60);

      if (error || !data) return [];

      return data.map(n => ({
        id: n.id,
        recipientId: n.recipient_id,
        actorId: n.actor_id,
        actorName: 'User',
        category: (n.category as NotificationCategory) || 'general',
        notificationType: n.notification_type || 'update',
        title: n.title,
        body: n.body,
        relatedEntityType: n.related_entity_type,
        relatedEntityId: n.related_entity_id,
        linkUrl: n.link_url,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at,
      }));
    } catch (err) {
      console.warn('communicationService.getNotifications exception:', err);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return !error;
    } catch (err) {
      return false;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      return !error;
    } catch (err) {
      return false;
    }
  },

  /**
   * Fetch notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        newMessagesInApp: Boolean(data.new_messages_in_app),
        newMessagesEmail: Boolean(data.new_messages_email),
        freelanceUpdatesInApp: Boolean(data.freelance_updates_in_app),
        freelanceUpdatesEmail: Boolean(data.freelance_updates_email),
        recruitUpdatesInApp: Boolean(data.recruit_updates_in_app),
        recruitUpdatesEmail: Boolean(data.recruit_updates_email),
        teamUpInvitesInApp: Boolean(data.teamup_invites_in_app),
        teamUpInvitesEmail: Boolean(data.teamup_invites_email),
        accountAlertsInApp: Boolean(data.account_alerts_in_app),
        accountAlertsEmail: Boolean(data.account_alerts_email),
      };
    } catch (err) {
      return null;
    }
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };
      if (prefs.newMessagesInApp !== undefined) updates.new_messages_in_app = prefs.newMessagesInApp;
      if (prefs.newMessagesEmail !== undefined) updates.new_messages_email = prefs.newMessagesEmail;
      if (prefs.freelanceUpdatesInApp !== undefined) updates.freelance_updates_in_app = prefs.freelanceUpdatesInApp;
      if (prefs.freelanceUpdatesEmail !== undefined) updates.freelance_updates_email = prefs.freelanceUpdatesEmail;
      if (prefs.recruitUpdatesInApp !== undefined) updates.recruit_updates_in_app = prefs.recruitUpdatesInApp;
      if (prefs.recruitUpdatesEmail !== undefined) updates.recruit_updates_email = prefs.recruitUpdatesEmail;
      if (prefs.teamUpInvitesInApp !== undefined) updates.teamup_invites_in_app = prefs.teamUpInvitesInApp;
      if (prefs.teamUpInvitesEmail !== undefined) updates.teamup_invites_email = prefs.teamUpInvitesEmail;
      if (prefs.accountAlertsInApp !== undefined) updates.account_alerts_in_app = prefs.accountAlertsInApp;
      if (prefs.accountAlertsEmail !== undefined) updates.account_alerts_email = prefs.accountAlertsEmail;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: userId, ...updates });

      return !error;
    } catch (err) {
      return false;
    }
  },
};
