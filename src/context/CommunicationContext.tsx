import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Conversation,
  Message,
  NotificationItem,
  NotificationPreferences,
  ConversationContextType,
} from '../types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../data/communicationData';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface CreateConversationOptions {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientHeadline?: string;
  contextType?: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  contextUrl?: string;
  initialMessage?: string;
}

interface CommunicationContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  notifications: NotificationItem[];
  notificationPreferences: NotificationPreferences;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  loading: boolean;
  getConversationById: (id: string) => Conversation | undefined;
  getMessagesForConversation: (conversationId: string) => Message[];
  createOrGetConversation: (options: CreateConversationOptions) => Promise<{ success: boolean; conversationId?: string; error?: string }>;
  sendMessage: (conversationId: string, text: string) => Promise<{ success: boolean; message?: Message; error?: string }>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string, archive: boolean) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<{ success: boolean; error?: string }>;
  createNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  isRealtimeConnected: boolean;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

const STORAGE_CONVERSATIONS_KEY = 'hustl_conversations_v2';
const STORAGE_MESSAGES_KEY = 'hustl_messages_v2';
const STORAGE_NOTIFICATIONS_KEY = 'hustl_notifications_v2';
const STORAGE_PREFS_KEY = 'hustl_notification_prefs_v2';
const SYNC_EVENT_NAME = 'hustl:communication_sync';

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'usr_demo_8829';

  const [loading, setLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(isSupabaseConfigured);

  // 1. Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse conversations from storage', e);
    }
    return INITIAL_CONVERSATIONS;
  });

  // 2. Messages State (grouped by conversation ID)
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse messages from storage', e);
    }
    return INITIAL_MESSAGES;
  });

  // 3. Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse notifications from storage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 4. Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse preferences from storage', e);
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(notificationPreferences));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [notificationPreferences]);

  // Cross-tab synchronization via window Storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_CONVERSATIONS_KEY && e.newValue) {
        try {
          setConversations(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_MESSAGES_KEY && e.newValue) {
        try {
          setMessages(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_NOTIFICATIONS_KEY && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Supabase Realtime Integration when backend is active
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsRealtimeConnected(false);
      return;
    }

    try {
      const channel = supabase
        .channel('hustl_messaging_room')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new as any;
              setMessages((prev) => {
                const list = prev[newMsg.conversation_id] || [];
                if (list.some((m) => m.id === newMsg.id)) return prev;
                return {
                  ...prev,
                  [newMsg.conversation_id]: [
                    ...list,
                    {
                      id: newMsg.id,
                      conversationId: newMsg.conversation_id,
                      senderId: newMsg.sender_id,
                      senderName: newMsg.sender_name || 'Participant',
                      body: newMsg.body,
                      createdAt: newMsg.created_at,
                      isRead: newMsg.is_read,
                    },
                  ],
                };
              });
            }
          }
        )
        .subscribe((status) => {
          setIsRealtimeConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription not supported or failed', err);
      setIsRealtimeConnected(false);
    }
  }, []);

  // Calculate unread counts
  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, conv) => {
      if (conv.isArchived) return acc;
      return acc + (conv.unreadCount || 0);
    }, 0);
  }, [conversations]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && n.recipientId === currentUserId).length;
  }, [notifications, currentUserId]);

  const getConversationById = useCallback(
    (id: string) => {
      return conversations.find((c) => c.id === id);
    },
    [conversations]
  );

  const getMessagesForConversation = useCallback(
    (conversationId: string) => {
      return messages[conversationId] || [];
    },
    [messages]
  );

  // 1. Create Or Get Conversation (Prevents duplicates and reuses existing thread)
  const createOrGetConversation = useCallback(
    async (options: CreateConversationOptions): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
      const {
        recipientId,
        recipientName,
        recipientAvatar,
        recipientHeadline,
        contextType = 'general',
        contextId,
        contextTitle,
        contextSubtitle,
        contextUrl,
        initialMessage,
      } = options;

      if (!recipientId || recipientId === currentUserId) {
        return { success: false, error: 'Cannot start conversation with yourself or missing recipient ID.' };
      }

      // Check if an eligible conversation already exists between current user & recipient
      const existing = conversations.find((conv) => {
        const hasBoth =
          conv.participantIds.includes(currentUserId) && conv.participantIds.includes(recipientId);
        if (!hasBoth) return false;

        // If contextId is provided, prefer matching exact context, else match same users
        if (contextId && conv.contextId === contextId) return true;
        if (!contextId && conv.contextType === 'general') return true;
        return false;
      });

      if (existing) {
        // If an initial message is provided, append it to existing
        if (initialMessage && initialMessage.trim().length > 0) {
          await sendMessage(existing.id, initialMessage.trim());
        }
        return { success: true, conversationId: existing.id };
      }

      // Create new conversation
      const newConvId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newConversation: Conversation = {
        id: newConvId,
        participantIds: [currentUserId, recipientId],
        participants: [
          {
            id: currentUserId,
            name: user?.fullName || 'Current User',
            avatarUrl: user?.avatarUrl || '',
            roleTitle: 'HUSTL Operator',
            headline: user?.bio || '',
          },
          {
            id: recipientId,
            name: recipientName,
            avatarUrl: recipientAvatar || '',
            roleTitle: recipientHeadline || 'Participant',
            headline: recipientHeadline || '',
          },
        ],
        conversationType:
          contextType === 'freelance'
            ? 'project'
            : contextType === 'recruit'
            ? 'job'
            : contextType === 'teamup'
            ? 'teamup'
            : 'direct',
        contextType,
        contextId,
        contextTitle,
        contextSubtitle,
        contextUrl,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      };

      // Add conversation
      setConversations((prev) => [newConversation, ...prev]);

      // If initial message provided, add message
      if (initialMessage && initialMessage.trim().length > 0) {
        const msgId = `msg-${Date.now()}`;
        const newMsg: Message = {
          id: msgId,
          conversationId: newConvId,
          senderId: currentUserId,
          senderName: user?.fullName || 'Current User',
          senderAvatar: user?.avatarUrl || '',
          body: initialMessage.trim(),
          createdAt: now,
          isRead: false,
        };

        setMessages((prev) => ({
          ...prev,
          [newConvId]: [newMsg],
        }));

        newConversation.lastMessage = newMsg;
      }

      return { success: true, conversationId: newConvId };
    },
    [conversations, currentUserId, user]
  );

  // 2. Send Message with validation and error handling
  const sendMessage = useCallback(
    async (conversationId: string, text: string): Promise<{ success: boolean; message?: Message; error?: string }> => {
      const trimmed = text.trim();
      if (!trimmed) {
        return { success: false, error: 'Message cannot be empty.' };
      }

      if (trimmed.length > 3000) {
        return { success: false, error: 'Message exceeds character limit of 3,000 characters.' };
      }

      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) {
        return { success: false, error: 'Conversation not found.' };
      }

      if (!conversation.participantIds.includes(currentUserId)) {
        return { success: false, error: 'Unauthorized: You are not a participant in this conversation.' };
      }

      const now = new Date().toISOString();
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newMsg: Message = {
        id: messageId,
        conversationId,
        senderId: currentUserId,
        senderName: user?.fullName || 'Current User',
        senderAvatar: user?.avatarUrl || '',
        body: trimmed,
        createdAt: now,
        isRead: false,
      };

      // 1. Update message list for this conversation
      setMessages((prev) => {
        const existingList = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...existingList, newMsg],
        };
      });

      // 2. Update conversation lastMessage & lastMessageAt
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: newMsg,
              lastMessageAt: now,
              updatedAt: now,
            };
          }
          return c;
        })
      );

      // 3. Create Notification for the recipient if they are not the sender
      const recipientParticipant = conversation.participants.find((p) => p.id !== currentUserId);
      if (recipientParticipant) {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          recipientId: recipientParticipant.id,
          actorId: currentUserId,
          actorName: user?.fullName || 'HUSTL Member',
          actorAvatar: user?.avatarUrl || '',
          category: 'messaging',
          notificationType: 'new_message',
          title: `New message from ${user?.fullName || 'HUSTL Member'}`,
          body: `"${trimmed.length > 80 ? trimmed.substring(0, 80) + '...' : trimmed}"`,
          relatedEntityType: 'conversation',
          relatedEntityId: conversationId,
          linkUrl: `/messages/${conversationId}`,
          isRead: false,
          createdAt: now,
        };

        setNotifications((prev) => [newNotif, ...prev]);
      }

      // If Supabase is active, persist to database
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('messages').insert({
            id: messageId,
            conversation_id: conversationId,
            sender_id: currentUserId,
            body: trimmed,
            is_read: false,
          });

          await supabase
            .from('conversations')
            .update({ last_message_at: now, updated_at: now })
            .eq('id', conversationId);
        } catch (dbErr) {
          console.warn('Database sync encountered an issue, kept local state', dbErr);
        }
      }

      return { success: true, message: newMsg };
    },
    [conversations, currentUserId, user]
  );

  // 3. Mark Conversation As Read
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        })
      );

      setMessages((prev) => {
        const list = prev[conversationId];
        if (!list) return prev;
        const updated = list.map((m) => (m.senderId !== currentUserId ? { ...m, isRead: true } : m));
        return { ...prev, [conversationId]: updated };
      });

      // Mark related message notifications as read
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.relatedEntityId === conversationId && n.category === 'messaging') {
            return { ...n, isRead: true };
          }
          return n;
        })
      );
    },
    [currentUserId]
  );

  // 4. Archive Conversation
  const archiveConversation = useCallback(async (conversationId: string, archive: boolean) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, isArchived: archive };
        }
        return c;
      })
    );
  }, []);

  // 5. Notifications Management
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const createNotification = useCallback(
    async (data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
      const now = new Date().toISOString();
      const newNotif: NotificationItem = {
        ...data,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        isRead: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('notifications').insert({
            id: newNotif.id,
            recipient_id: newNotif.recipientId,
            actor_id: newNotif.actorId,
            category: newNotif.category,
            notification_type: newNotif.notificationType,
            title: newNotif.title,
            body: newNotif.body,
            related_entity_type: newNotif.relatedEntityType,
            related_entity_id: newNotif.relatedEntityId,
            link_url: newNotif.linkUrl,
            is_read: false,
          });
        } catch (e) {
          console.warn('Failed to insert notification into supabase', e);
        }
      }
    },
    []
  );

  // 6. Update Notification Preferences
  const updateNotificationPreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> => {
      try {
        setNotificationPreferences((prev) => ({
          ...prev,
          ...prefs,
        }));
        return { success: true };
      } catch (err) {
        return { success: false, error: 'Failed to update preferences.' };
      }
    },
    []
  );

  return (
    <CommunicationContext.Provider
      value={{
        conversations,
        messages,
        notifications,
        notificationPreferences,
        unreadMessagesCount,
        unreadNotificationsCount,
        loading,
        getConversationById,
        getMessagesForConversation,
        createOrGetConversation,
        sendMessage,
        markConversationAsRead,
        archiveConversation,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        updateNotificationPreferences,
        createNotification,
        isRealtimeConnected,
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = (): CommunicationContextType => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
