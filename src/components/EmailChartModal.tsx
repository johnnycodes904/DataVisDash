import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { ChartConfig } from '../types';
import { generateChartPdfBlob } from '../utils/pdfExport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: ChartConfig;
  targetElementId: string;
  datasetName?: string;
}

export const EmailChartModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  targetElementId,
  datasetName
}) => {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate limiting state from server
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);
  const [checkingRateLimit, setCheckingRateLimit] = useState(false);

  // Check rate limit status upon opening
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    const checkRateLimit = async () => {
      setCheckingRateLimit(true);
      try {
        const res = await fetch('/api/email/rate-limit-status');
        const data = await res.json();
        if (isMounted && data.remainingSeconds > 0) {
          setRateLimitSeconds(data.remainingSeconds);
        } else if (isMounted) {
          setRateLimitSeconds(0);
        }
      } catch (e) {
        console.error('Failed to query rate limit status:', e);
      } finally {
        if (isMounted) setCheckingRateLimit(false);
      }
    };

    checkRateLimit();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;

    const timer = setInterval(() => {
      setRateLimitSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  if (!isOpen) return null;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid recipient email address.');
      return;
    }

    if (rateLimitSeconds > 0) {
      setErrorMessage(
        `Rate limit active: Please wait ${formatCountdown(rateLimitSeconds)} before sending another email.`
      );
      return;
    }

    const element = document.getElementById(targetElementId);
    if (!element) {
      setErrorMessage('Unable to locate the chart element for capture.');
      return;
    }

    try {
      setIsGenerating(true);
      const { base64, filename } = await generateChartPdfBlob({
        element,
        title: config.title,
        chartType: config.type,
        description: config.description,
        datasetName
      });

      setIsGenerating(false);
      setIsSending(true);

      const res = await fetch('/api/email/send-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toEmail: email.trim(),
          chartTitle: config.title,
          chartType: config.type,
          pdfBase64: base64,
          filename,
          note: note.trim()
        })
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimitSeconds(result.retryAfterSeconds || 300);
          throw new Error(result.error || 'Rate limit exceeded: 1 send every 5 minutes.');
        }
        throw new Error(result.error || 'Failed to dispatch email.');
      }

      setSuccessMessage(`Success! Chart PDF dispatched to ${email}.`);
      setRateLimitSeconds(300); // 5 minutes rate limit
      setEmail('');
      setNote('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while sending the email.');
    } finally {
      setIsGenerating(false);
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Send Chart Report via Email</h3>
              <p className="text-[11px] text-slate-400">Export as PDF attachment directly to inbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendEmail} className="p-5 space-y-4">
          {/* Target Chart Preview Info */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-200 truncate">{config.title}</p>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                  {config.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Attachment format: High-res PDF ({datasetName || 'Dataset'})
              </p>
            </div>
          </div>

          {/* Rate limit notification badge */}
          {rateLimitSeconds > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-semibold block">Rate Limit Protection Active</span>
                <span className="text-[11px] text-amber-300/90">
                  Email sending is restricted to 1 dispatch every 5 minutes per IP address. You can send your next email in{' '}
                  <span className="font-mono font-bold text-amber-200">{formatCountdown(rateLimitSeconds)}</span>.
                </span>
              </div>
            </div>
          )}

          {/* Recipient Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Recipient Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. analyst@company.com"
              disabled={rateLimitSeconds > 0 || isSending || isGenerating}
              className="w-full px-3.5 py-2 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600"
            />
          </div>

          {/* Optional Message / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Message or Note (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Included in email subject/summary..."
              disabled={rateLimitSeconds > 0 || isSending || isGenerating}
              className="w-full px-3.5 py-2 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Error & Success States */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-[11px]">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={rateLimitSeconds > 0 || isSending || isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating PDF...
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending Email...
                </>
              ) : rateLimitSeconds > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Rate Limited ({formatCountdown(rateLimitSeconds)})
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send PDF via Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
