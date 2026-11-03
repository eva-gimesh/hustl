import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TalentProfile, ConversationContextType } from '../../types';
import { useCommunication } from '../../context/CommunicationContext';
import { Button } from '../ui/Button';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface MessageRecipient {
  id: string;
  name: string;
  title?: string;
  role?: string;
  handle?: string;
  institution?: string;
  avatarInitials?: string;
  avatarUrl?: string;
  skills?: string[];
}

interface MessageModalProps {
  recipient: (TalentProfile | MessageRecipient) | null;
  contextType?: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  contextUrl?: string;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  recipient,
  contextType = 'general',
  contextId,
  contextTitle,
  contextSubtitle,
  contextUrl,
  onClose,
}) => {
  const navigate = useNavigate();
  const { createOrGetConversation } = useCommunication();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!recipient) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    setErrorMessage(null);

    const res = await createOrGetConversation({
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientAvatar: (recipient as any).avatarUrl,
      recipientHeadline: (recipient as any).headline || (recipient as any).title || (recipient as any).role,
      contextType,
      contextId,
      contextTitle,
      contextSubtitle,
      contextUrl,
      initialMessage: trimmed,
    });

    setSending(false);

    if (res.success && res.conversationId) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage('');
        onClose();
        navigate(`/messages/${res.conversationId}`);
      }, 800);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch message.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141B15] border border-[#273128] rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#273128]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#101510] border border-[#B6FF4A] text-[#B6FF4A] font-display font-bold text-sm flex items-center justify-center shrink-0">
              {recipient.avatarInitials || recipient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#B6FF4A]">
                DIRECT CHANNEL
              </span>
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                Message {recipient.name}
              </h3>
              {recipient.handle && (
                <p className="text-xs font-mono text-[#A0AAA0]">@{recipient.handle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A0AAA0] hover:text-white transition-colors cursor-pointer"
            aria-label="Close message dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Context indicator */}
        {contextTitle && (
          <div className="p-2.5 bg-[#101510] border border-[#273128] rounded-xs text-xs font-mono flex items-center gap-2">
            <span className="px-1.5 py-0.2 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[#B6FF4A] text-[9px] uppercase font-bold">
              {contextType}
            </span>
            <span className="text-[#F4F7F1] font-semibold truncate">{contextTitle}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content */}
        {sent ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#101510] border border-[#B6FF4A] text-[#B6FF4A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-[#F4F7F1]">
              Transmission Dispatched
            </h4>
            <p className="text-xs text-[#A0AAA0] max-w-xs mx-auto font-mono">
              Your inquiry has been relayed to {recipient.name}'s verified communication inbox. Redirecting to thread...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#A0AAA0] block">
                Message Content
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${recipient.name.split(' ')[0]}, I saw your work on ${recipient.skills?.[0] || 'HUSTL'} and would love to collaborate...`}
                className="w-full bg-[#101510] text-[#F4F7F1] border border-[#273128] focus:border-[#B6FF4A] p-3 text-sm rounded-xs focus:outline-hidden font-sans"
                required
              />
            </div>

            <div className="p-3 bg-[#101510] border border-[#273128] rounded-xs flex items-center justify-between text-[11px] font-mono text-[#A0AAA0]">
              <span>Direct encrypted routing</span>
              <span className="text-[#B6FF4A]">Live Sync Active</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={sending}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Transmit Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
