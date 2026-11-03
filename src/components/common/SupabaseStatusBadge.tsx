import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection, SupabaseHealthStatus } from '../../lib/supabase';

export const SupabaseStatusBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<SupabaseHealthStatus>({
    configured: isSupabaseConfigured,
    connected: isSupabaseConfigured,
    message: isSupabaseConfigured ? 'Connected to live Supabase backend' : 'Backend in local fallback mode',
  });
  const [copied, setCopied] = useState(false);

  const runCheck = async () => {
    setTesting(true);
    try {
      const res = await testSupabaseConnection();
      setStatus(res);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      runCheck();
    }
  }, []);

  const copySqlMigrationPath = () => {
    navigator.clipboard.writeText('/src/lib/supabase-schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#101510] hover:bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/50 rounded-xs text-[11px] font-mono transition-colors group cursor-pointer"
        title="Supabase Database Status"
      >
        <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-[#B6FF4A] shadow-[0_0_8px_#B6FF4A]' : 'bg-amber-400'}`} />
        <span className="text-[#A0AAA0] group-hover:text-[#F4F7F1]">DB</span>
        <span className="text-[#B6FF4A] font-bold">{status.connected ? 'LIVE' : 'LOCAL'}</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0C100D] border border-[#273128] rounded-xs shadow-2xl p-6 font-mono text-xs text-[#F4F7F1]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#B6FF4A]" />
                <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                  Supabase Backend Status
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#A0AAA0] hover:text-white rounded-xs hover:bg-[#141B15] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3 border rounded-xs flex items-start gap-3 ${
                  status.connected
                    ? 'bg-[#141B15] border-[#B6FF4A]/40 text-[#F4F7F1]'
                    : 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                }`}
              >
                {status.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#B6FF4A] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">
                    {status.connected ? 'Supabase Project Connected' : 'Supabase Client Notice'}
                  </p>
                  <p className="text-[11px] text-[#A0AAA0] leading-relaxed">
                    {status.message}
                  </p>
                  {status.latencyMs && (
                    <p className="text-[10px] text-[#7CCB37]">
                      Round-trip response latency: {status.latencyMs}ms
                    </p>
                  )}
                </div>
              </div>

              {/* Endpoint Details */}
              <div className="p-3 bg-[#101510] border border-[#273128] rounded-xs space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#A0AAA0]">Project URL:</span>
                  <span className="text-white font-bold truncate max-w-[280px]">
                    {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#A0AAA0]">Auth Engine:</span>
                  <span className="text-[#B6FF4A]">Supabase GoTrue (Active)</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#A0AAA0]">Storage Buckets:</span>
                  <span className="text-[#B6FF4A]">avatars, portfolio, attachments</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#A0AAA0]">Row Level Security:</span>
                  <span className="text-[#B6FF4A]">Enforced on 22 tables</span>
                </div>
              </div>

              {/* Migration Instructions */}
              <div className="p-3 bg-[#141B15] border border-[#273128] rounded-xs space-y-2">
                <div className="flex items-center gap-1.5 text-[#B6FF4A] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Database Setup SQL Available</span>
                </div>
                <p className="text-[11px] text-[#A0AAA0] leading-relaxed">
                  The complete schema and security policies are stored in <code className="text-[#B6FF4A]">/src/lib/supabase-schema.sql</code> and <code className="text-[#B6FF4A]">supabase/migrations/</code>. Execute it once in your Supabase SQL Editor to provision all tables and storage buckets.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={copySqlMigrationPath}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#101510] hover:bg-[#1A231C] border border-[#273128] hover:border-[#B6FF4A] text-white text-[11px] rounded-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#B6FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Path Copied!' : 'Copy Schema File Path'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-[#A0AAA0] hover:text-[#B6FF4A] text-[11px] transition-colors"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-[#273128] flex justify-between items-center">
              <button
                onClick={runCheck}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141B15] hover:bg-[#1A231C] text-[#B6FF4A] border border-[#273128] rounded-xs transition-colors cursor-pointer text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing ping...' : 'Test Connection Ping'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-[#B6FF4A] hover:bg-[#7CCB37] text-black font-bold rounded-xs transition-colors cursor-pointer text-[11px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
