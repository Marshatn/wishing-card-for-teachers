import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, ExternalLink, Key, Lock } from 'lucide-react';
import { triggerBirthdayBurst } from '../utils/confetti';
import { audioEngine } from '../utils/audio';
import { TeacherCardData } from '../types/card';
import {
  getShareableSurpriseUrl,
  getShortSurpriseUrl,
  SHORT_WISH_ID,
  SECRET_ACCESS_CODE,
} from '../utils/cardStorage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: TeacherCardData;
}

// Crisp SVGs for WhatsApp & Telegram
export const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const TelegramIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.535-.194 1.006.128.832.941z" />
  </svg>
);

export { SHORT_WISH_ID, SECRET_ACCESS_CODE };
export const SURPRISE_CODE = SHORT_WISH_ID;

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  cardData,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Short URL with no code
  const shortUrl = getShortSurpriseUrl(false);
  // Short URL with pre-filled code
  const directUnlockUrl = getShortSurpriseUrl(true);

  const shareText = `🎁 SURPRISE! A 3D Farewell Keepsake Present has been prepared for ${cardData.teacherName} from ${cardData.senderGroup}!\n\n🔗 Link: ${shortUrl}\n🔑 Secret Access Code: ${SECRET_ACCESS_CODE}\n\nTap to open the 3D keepsake and hear the farewell melody!`;

  // WhatsApp share link
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  // Telegram share link
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shortUrl
  )}&text=${encodeURIComponent(
    `🎁 SURPRISE! 3D Farewell Keepsake for ${cardData.teacherName} (Secret Code: ${SECRET_ACCESS_CODE})`
  )}`;

  const copyToClipboard = async (text: string, type: 'link' | 'direct' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2600);
      } else if (type === 'direct') {
        setCopiedDirectLink(true);
        setTimeout(() => setCopiedDirectLink(false), 2600);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2600);
      }
      audioEngine.playChime(880, 0, 0.2);
      triggerBirthdayBurst();
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-stone-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Share Farewell Keepsake
              </h3>
              <p className="text-xs text-stone-400">
                Short Link & Secret Access Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Link & Secret Code Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/30 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Short Link Identifier: <code className="text-white ml-1 font-mono font-bold">{SHORT_WISH_ID}</code>
            </span>

            {/* Secret Code Chip with One-Tap Copy */}
            <button
              type="button"
              onClick={() => copyToClipboard(SECRET_ACCESS_CODE, 'code')}
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-mono font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Click to copy secret code"
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span>Secret Code: {SECRET_ACCESS_CODE}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
            </button>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Prepared with love for <strong className="text-white">{cardData.teacherName}</strong> from{' '}
            <strong className="text-amber-300">{cardData.senderGroup}</strong>.
            Recipients enter the 5-digit code <strong className="text-amber-400">{SECRET_ACCESS_CODE}</strong> to unlock the 3D present!
          </p>

          <div className="flex items-start gap-2 text-[11px] text-stone-300 bg-stone-950/70 border border-stone-800 p-2.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug space-y-1">
              <span className="font-semibold text-white">Direct Live Link:</span>
              <p className="text-stone-400">
                Works directly with no 404 error. To let outside recipients access without Google login (Error 403), use the <strong className="text-amber-300">Share</strong> button in AI Studio top right.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Social Share Buttons: WhatsApp & Telegram */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            One-Click Direct Share
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Direct Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold text-sm shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 fill-stone-950" />
              <span>Share to WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto" />
            </a>

            {/* Telegram Direct Share Button */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-bold text-sm shadow-lg shadow-[#229ED9]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <TelegramIcon className="w-5 h-5 fill-white" />
              <span>Share to Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto" />
            </a>
          </div>
        </div>

        {/* Short Link Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Clean Short Link (Requires Code {SECRET_ACCESS_CODE})</span>
            {copiedLink && (
              <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" /> Copied short link!
              </span>
            )}
          </label>

          <div className="flex items-center gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-800">
            <input
              type="text"
              readOnly
              value={shortUrl}
              className="flex-1 bg-transparent px-3 text-xs text-stone-300 font-mono focus:outline-hidden truncate select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(shortUrl, 'link')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md shadow-amber-400/20'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Direct Unlock Link */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Direct 1-Click Unlock Link (Auto-opens without code)</span>
            {copiedDirectLink && (
              <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" /> Copied direct unlock link!
              </span>
            )}
          </label>

          <div className="flex items-center gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-800">
            <input
              type="text"
              readOnly
              value={directUnlockUrl}
              className="flex-1 bg-transparent px-3 text-xs text-stone-400 font-mono focus:outline-hidden truncate select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(directUnlockUrl, 'direct')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedDirectLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Direct Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Copy Formatted Invitation Text */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => copyToClipboard(shareText, 'link')}
            className="w-full py-2.5 bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-semibold border border-stone-700/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copy Full Invitation (Includes Link + Code {SECRET_ACCESS_CODE})</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
