import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { Conversation, Message } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Search,
  Send,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  ArrowLeft,
  Briefcase,
  Layers,
  FolderGit2,
  Clock,
  Sparkles,
  Inbox,
  Filter,
  Check,
  CheckCheck
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || 'usr_demo_8829';

  const {
    conversations,
    getConversationById,
    getMessagesForConversation,
    sendMessage,
    markConversationAsRead,
    archiveConversation,
  } = useCommunication();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active conversation
  const activeConversation = useMemo(() => {
    if (!conversationId) return undefined;
    return getConversationById(conversationId);
  }, [conversationId, getConversationById]);

  // Messages for active conversation
  const activeMessages = useMemo(() => {
    if (!conversationId) return [];
    return getMessagesForConversation(conversationId);
  }, [conversationId, getMessagesForConversation]);

  // Other participant in the active conversation
  const otherParticipant = useMemo(() => {
    if (!activeConversation) return undefined;
    return activeConversation.participants.find((p) => p.id !== currentUserId) || activeConversation.participants[0];
  }, [activeConversation, currentUserId]);

  // Mark conversation as read on load or select
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, markConversationAsRead]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, conversationId]);

  // Filtered & searched conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        // Tab filtering
        if (filterTab === 'unread') {
          if ((conv.unreadCount || 0) <= 0) return false;
        } else if (filterTab === 'archived') {
          if (!conv.isArchived) return false;
        } else {
          // 'all' tab shows non-archived
          if (conv.isArchived) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchParticipant = conv.participants.some((p) =>
            p.name.toLowerCase().includes(q) || (p.headline && p.headline.toLowerCase().includes(q))
          );
          const matchContext = conv.contextTitle && conv.contextTitle.toLowerCase().includes(q);
          const matchLastMsg = conv.lastMessage?.body && conv.lastMessage.body.toLowerCase().includes(q);
          if (!matchParticipant && !matchContext && !matchLastMsg) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations, filterTab, searchQuery]);

  // Handle Send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!conversationId || sending) return;

    const trimmed = messageInput.trim();
    if (!trimmed) return;

    setSending(true);
    setSendError(null);

    const res = await sendMessage(conversationId, trimmed);
    setSending(false);

    if (res.success) {
      setMessageInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } else {
      setSendError(res.error || 'Failed to deliver message.');
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#080B09] text-[#F4F7F1] flex flex-col">
      {/* Top Header Bar */}
      <div className="border-b border-[#273128] bg-[#101510]/90 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#B6FF4A] font-bold tracking-wider uppercase">
              HUSTL // DIRECT_CHANNELS
            </span>
            <span className="text-[#273128]">/</span>
            <span className="font-mono text-xs text-[#A0AAA0]">
              End-to-End Opportunity Mesh
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
            <Link
              to="/settings/notifications"
              className="hover:text-[#F4F7F1] transition-colors"
            >
              Notification Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT PANE: CONVERSATION LIST (Hidden on mobile if chat)  */}
        {/* ======================================================== */}
        <div
          className={`lg:col-span-4 border-r border-[#273128] flex flex-col bg-[#101510] ${
            conversationId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-[#273128] space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A0AAA0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations, names or gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] pl-9 pr-3 py-2 rounded-xs focus:outline-hidden placeholder-[#A0AAA0]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#141B15] border border-[#273128] rounded-xs">
              {(['all', 'unread', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer text-center ${
                    filterTab === tab
                      ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                      : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#273128]/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Inbox className="w-8 h-8 text-[#A0AAA0]/40 mx-auto" />
                <p className="text-xs font-mono text-[#A0AAA0]">
                  {searchQuery
                    ? 'No conversations match your search.'
                    : filterTab === 'unread'
                    ? 'No unread messages.'
                    : filterTab === 'archived'
                    ? 'No archived conversations.'
                    : 'No conversations yet.'}
                </p>
                {filterTab === 'all' && !searchQuery && (
                  <p className="text-[11px] font-mono text-[#A0AAA0]/80">
                    Connect with founders on <Link to="/teamup" className="text-[#B6FF4A] hover:underline">TeamUp</Link>, apply to <Link to="/recruit/opportunities" className="text-cyan-400 hover:underline">Recruit Openings</Link>, or contact clients on <Link to="/freelance" className="text-[#7CCB37] hover:underline">Freelance Gigs</Link>.
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== currentUserId) || conv.participants[0];
                const isSelected = conv.id === conversationId;
                const hasUnread = (conv.unreadCount || 0) > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-[#141B15] border-l-2 border-l-[#B6FF4A]'
                        : 'hover:bg-[#141B15]/60'
                    }`}
                  >
                    {/* Participant Avatar */}
                    <div className="w-10 h-10 bg-[#080B09] border border-[#273128] text-[#B6FF4A] font-display font-bold text-xs flex items-center justify-center shrink-0 rounded-xs overflow-hidden">
                      {other.avatarUrl ? (
                        <img src={other.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        other.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`font-display text-sm truncate ${
                          hasUnread ? 'font-bold text-[#F4F7F1]' : 'font-medium text-[#F4F7F1]'
                        }`}>
                          {other.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#A0AAA0] shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Context Pill (if related to project/job/idea) */}
                      {conv.contextTitle && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7CCB37] truncate mb-1">
                          <span className="uppercase text-[9px] px-1 py-0.2 bg-[#7CCB37]/10 border border-[#7CCB37]/30 rounded-xs">
                            {conv.contextType || 'Gig'}
                          </span>
                          <span className="truncate">{conv.contextTitle}</span>
                        </div>
                      )}

                      {/* Last Message Preview */}
                      <p className={`text-xs font-mono truncate ${
                        hasUnread ? 'text-[#F4F7F1] font-semibold' : 'text-[#A0AAA0]'
                      }`}>
                        {conv.lastMessage?.senderId === currentUserId ? 'You: ' : ''}
                        {conv.lastMessage?.body || 'Conversation started.'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#B6FF4A] shrink-0 mt-2"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: ACTIVE CONVERSATION VIEW                     */}
        {/* ======================================================== */}
        <div
          className={`lg:col-span-8 flex flex-col bg-[#080B09] ${
            conversationId ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {activeConversation && otherParticipant ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-4 border-b border-[#273128] bg-[#101510] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => navigate('/messages')}
                    className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] lg:hidden cursor-pointer"
                    aria-label="Back to messages list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 bg-[#080B09] border border-[#B6FF4A] text-[#B6FF4A] font-display font-bold text-xs flex items-center justify-center shrink-0 rounded-xs overflow-hidden">
                    {otherParticipant.avatarUrl ? (
                      <img src={otherParticipant.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      otherParticipant.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-base text-[#F4F7F1] truncate">
                        {otherParticipant.name}
                      </h2>
                      <span className="px-1.5 py-0.2 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[9px] font-mono text-[#B6FF4A] uppercase">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#A0AAA0] truncate">
                      {otherParticipant.headline || otherParticipant.roleTitle || 'HUSTL Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/profile/${otherParticipant.id}`}
                    className="px-2.5 py-1 bg-[#141B15] hover:bg-[#1f2920] border border-[#273128] text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors flex items-center gap-1.5"
                    title="View public profile"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      archiveConversation(activeConversation.id, !activeConversation.isArchived);
                    }}
                    className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] bg-[#141B15] rounded-xs transition-colors cursor-pointer"
                    title={activeConversation.isArchived ? 'Unarchive' : 'Archive conversation'}
                  >
                    {activeConversation.isArchived ? (
                      <ArchiveRestore className="w-4 h-4 text-[#B6FF4A]" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Opportunity Context Banner (If attached to freelance gig, job, or venture) */}
              {activeConversation.contextTitle && (
                <div className="px-4 py-2.5 bg-[#141B15] border-b border-[#273128] flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[#B6FF4A] text-[10px] uppercase font-bold shrink-0">
                      {activeConversation.contextType || 'Context'}
                    </span>
                    <span className="text-[#F4F7F1] font-semibold truncate">
                      {activeConversation.contextTitle}
                    </span>
                    {activeConversation.contextSubtitle && (
                      <span className="text-[#A0AAA0] hidden sm:inline truncate">
                        · {activeConversation.contextSubtitle}
                      </span>
                    )}
                  </div>

                  {activeConversation.contextUrl && (
                    <Link
                      to={activeConversation.contextUrl}
                      className="text-[#B6FF4A] hover:underline flex items-center gap-1 shrink-0 text-[11px]"
                    >
                      <span>Inspect Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-[#A0AAA0]">
                    <Sparkles className="w-8 h-8 text-[#B6FF4A]" />
                    <p className="font-display font-bold text-sm text-[#F4F7F1]">
                      Direct Channel Established
                    </p>
                    <p className="text-xs font-mono max-w-sm">
                      Send your initial message below to discuss collaboration, milestones, or questions.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-[#A0AAA0]">
                          <span>{isMe ? 'You' : msg.senderName}</span>
                          <span>·</span>
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>

                        <div
                          className={`max-w-xl p-3.5 rounded-xs text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                            isMe
                              ? 'bg-[#141B15] border border-[#B6FF4A]/50 text-[#F4F7F1] shadow-[0_4px_20px_rgba(182,255,74,0.05)]'
                              : 'bg-[#101510] border border-[#273128] text-[#F4F7F1]'
                          }`}
                        >
                          {msg.body}
                        </div>

                        {/* Read receipt indicator for user's own sent messages */}
                        {isMe && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-[#A0AAA0]">
                            {msg.isRead ? (
                              <span className="flex items-center gap-0.5 text-[#B6FF4A]">
                                <CheckCheck className="w-3 h-3" />
                                <span>Read</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[#A0AAA0]">
                                <Check className="w-3 h-3" />
                                <span>Delivered</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Area */}
              <div className="p-4 border-t border-[#273128] bg-[#101510] shrink-0 space-y-2">
                {sendError && (
                  <div className="p-2 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{sendError}</span>
                    </div>
                    <button
                      onClick={() => setSendError(null)}
                      className="text-rose-300 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        setSendError(null);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${otherParticipant.name}... (Press Enter to send, Shift+Enter for new line)`}
                      rows={2}
                      className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] p-3 rounded-xs focus:outline-hidden placeholder-[#A0AAA0]/60 resize-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#A0AAA0]">
                      {messageInput.length} / 3,000 characters
                    </span>

                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sending}
                      className={`px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-2 rounded-xs cursor-pointer ${
                        !messageInput.trim() || sending
                          ? 'bg-[#141B15] border border-[#273128] text-[#A0AAA0] cursor-not-allowed opacity-50'
                          : 'bg-[#B6FF4A] text-[#080B09] hover:bg-[#7CCB37]'
                      }`}
                    >
                      {sending ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Empty State when no conversation selected on desktop
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-[#141B15] border border-[#273128] flex items-center justify-center rounded-xs text-[#B6FF4A]">
                <Inbox className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                  Select a Conversation
                </h3>
                <p className="text-xs font-mono text-[#A0AAA0] max-w-sm">
                  Choose a thread from the inbox rail to review direct messages and discuss opportunities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
