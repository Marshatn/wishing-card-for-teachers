import React, { useState, useEffect } from 'react';
import {
  TeacherCardData,
  PresentTheme,
  FAREWELL_SONGS,
  MESSAGE_PRESETS,
} from '../types/card';
import { audioEngine } from '../utils/audio';
import { triggerBirthdayBurst, triggerStarShower } from '../utils/confetti';
import { WhatsAppIcon, TelegramIcon } from './ShareModal';
import {
  getShareableSurpriseUrl,
  getShortSurpriseUrl,
  SHORT_WISH_ID,
  SECRET_ACCESS_CODE,
} from '../utils/cardStorage';
import {
  Music,
  Sparkles,
  Share2,
  Printer,
  Check,
  Heart,
  Calendar,
  Send,
  X,
  Edit3,
  CheckCircle,
  Save,
} from 'lucide-react';

interface CardReaderModalProps {
  cardData: TeacherCardData;
  theme: PresentTheme;
  isOpen: boolean;
  onClose: () => void;
  onAddSignature: (name: string) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  onOpenCalendar: () => void;
  onOpenCustomizer?: () => void;
  onUpdateCardData?: (updated: TeacherCardData) => void;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const CardReaderModal: React.FC<CardReaderModalProps> = ({
  cardData,
  isOpen,
  onClose,
  onAddSignature,
  isPlayingMusic,
  onToggleMusic,
  onOpenCalendar,
  onOpenCustomizer,
  onUpdateCardData,
}) => {
  const [newSigner, setNewSigner] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Local draft state for quick inline editing on the parchment card
  const [draftCard, setDraftCard] = useState<TeacherCardData>(cardData);

  useEffect(() => {
    if (isOpen) {
      setDraftCard(cardData);
      setIsEditingInline(false);
    }
  }, [isOpen, cardData]);

  if (!isOpen) return null;

  const currentSong =
    FAREWELL_SONGS.find((s) => s.id === cardData.selectedSongId) || FAREWELL_SONGS[0];

  const handleAddSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigner.trim()) return;
    onAddSignature(newSigner.trim());
    audioEngine.playChime(1046.5, 0, 0.4);
    setNewSigner('');
    triggerStarShower();
  };

  const surpriseUrl = getShortSurpriseUrl(false);
  const shareMessage = `🎁 SURPRISE! A 3D Farewell Keepsake Present has been prepared for ${cardData.teacherName} from ${cardData.senderGroup}!\n\n🔗 Link: ${surpriseUrl}\n🔑 Secret Code: ${SECRET_ACCESS_CODE}\n\nTap to open the 3D keepsake and hear the farewell melody!`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(surpriseUrl)}&text=${encodeURIComponent(`🎁 SURPRISE! 3D Farewell Keepsake for ${cardData.teacherName} (Code: ${SECRET_ACCESS_CODE})`)}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(surpriseUrl);
      setCopiedLink(true);
      audioEngine.playChime(880, 0, 0.2);
      triggerStarShower();
      setTimeout(() => setCopiedLink(false), 2600);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const spawnReaction = (emoji: string) => {
    const newId = Date.now() + Math.random();
    const newReaction: FloatingReaction = {
      id: newId,
      emoji,
      x: 35 + Math.random() * 30,
      y: 40 + Math.random() * 20,
    };
    setReactions((prev) => [...prev, newReaction]);
    audioEngine.playChime(700 + Math.random() * 300, 0, 0.15);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 1500);
  };

  // Save inline edits
  const handleSaveInline = () => {
    if (onUpdateCardData) {
      onUpdateCardData(draftCard);
    }
    setIsEditingInline(false);
    setSavedSuccess(true);
    audioEngine.playChime(880, 0, 0.3);
    triggerBirthdayBurst();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Floating Reaction Sprites */}
      {reactions.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none text-4xl sm:text-5xl transition-all duration-1000 z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            animation: 'floatSlow 1.5s ease-out forwards',
          }}
        >
          {r.emoji}
        </div>
      ))}

      <div
        className="relative w-full max-w-3xl my-auto rounded-3xl overflow-hidden shadow-2xl border border-amber-400/30 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ornate Banner */}
        <div className="relative px-4 sm:px-6 py-4 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border-b border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 text-base sm:text-lg shrink-0">
              💐
            </span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-amber-400 truncate">
                Official Keepsake Farewell Card
              </p>
              <h2 className="text-base sm:text-xl font-bold font-display tracking-tight text-white truncate">
                Farewell & Thank You, Teacher!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Edit Wishes Action in Top Banner */}
            <button
              onClick={() => {
                if (onOpenCustomizer) {
                  onClose();
                  onOpenCustomizer();
                } else {
                  setIsEditingInline(!isEditingInline);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Edit Wishes & Customize Card"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingInline ? 'Cancel Edit' : 'Edit Wishes'}</span>
            </button>

            <button
              onClick={onToggleMusic}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
                isPlayingMusic
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-lg shadow-amber-500/25'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700'
              }`}
              title={isPlayingMusic ? `Playing: ${currentSong.title}` : `Play ${currentSong.title}`}
            >
              <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
              <span className="hidden md:inline">
                {isPlayingMusic ? currentSong.title : 'Play Song'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors border border-stone-700 cursor-pointer"
              aria-label="Close card viewer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Card Body - Parchment Classroom Styling */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] bg-opacity-5">
          {/* Card Parchment Container */}
          <div className="relative p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/90 to-yellow-50 text-stone-900 border-4 border-double border-amber-400/80 shadow-xl">
            {/* Corner Ornamental Stamps */}
            <div className="absolute top-3 left-3 text-amber-600/40 text-lg select-none">✦</div>
            <div className="absolute top-3 right-3 text-amber-600/40 text-lg select-none">✦</div>
            <div className="absolute bottom-3 left-3 text-amber-600/40 text-lg select-none">✦</div>
            <div className="absolute bottom-3 right-3 text-amber-600/40 text-lg select-none">✦</div>

            {/* Top edit trigger inside parchment */}
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCustomizer && !isEditingInline) {
                    setIsEditingInline(true);
                  } else {
                    setIsEditingInline(!isEditingInline);
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-200/80 hover:bg-amber-300 text-amber-900 border border-amber-400/60 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3 h-3 text-amber-800" />
                <span>{isEditingInline ? 'Hide Editor' : '✏️ Quick Edit Wishes'}</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Wishes successfully updated and saved!</span>
              </div>
            )}

            {isEditingInline ? (
              /* Inline Editable Form directly inside Parchment */
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Teacher's Title / Greeting
                  </label>
                  <input
                    type="text"
                    value={draftCard.recipientTitle}
                    onChange={(e) =>
                      setDraftCard({ ...draftCard, recipientTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/90 border border-amber-300 rounded-lg text-stone-900 text-sm focus:outline-hidden focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Teacher's Name
                  </label>
                  <input
                    type="text"
                    value={draftCard.teacherName}
                    onChange={(e) =>
                      setDraftCard({ ...draftCard, teacherName: e.target.value })
                    }
                    placeholder="e.g. Mrs. Anderson, 曾老师"
                    className="w-full px-3 py-2 bg-white/90 border border-amber-300 rounded-lg text-stone-900 text-base font-bold font-display focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Farewell Wishes Message
                    </label>
                    <div className="flex gap-1">
                      {MESSAGE_PRESETS.slice(0, 3).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDraftCard({ ...draftCard, farewellMessage: p.text })}
                          className="text-[10px] px-1.5 py-0.5 bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-semibold rounded-sm transition-colors cursor-pointer"
                        >
                          {p.title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={draftCard.farewellMessage}
                    onChange={(e) =>
                      setDraftCard({ ...draftCard, farewellMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/90 border border-amber-300 rounded-lg text-stone-900 text-sm focus:outline-hidden focus:border-amber-500 leading-relaxed font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Sign-Off
                    </label>
                    <input
                      type="text"
                      value={draftCard.signOff}
                      onChange={(e) =>
                        setDraftCard({ ...draftCard, signOff: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-white/90 border border-amber-300 rounded-lg text-stone-900 text-xs focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                      School / Sender
                    </label>
                    <input
                      type="text"
                      value={draftCard.senderGroup}
                      onChange={(e) =>
                        setDraftCard({ ...draftCard, senderGroup: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-white/90 border border-amber-300 rounded-lg text-stone-900 text-xs font-bold focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCustomizer) {
                        onClose();
                        onOpenCustomizer();
                      }
                    }}
                    className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    Open full customizer (colors, songs)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInline(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInline}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Wishes</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Parchment Display */
              <>
                {/* Recipient Header */}
                <div className="text-center space-y-2 mb-6">
                  <span className="inline-block text-xs font-bold tracking-widest text-amber-800 uppercase px-3 py-1 bg-amber-200/60 rounded-md">
                    {cardData.recipientTitle}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black font-display text-stone-900 tracking-tight">
                    {cardData.teacherName}
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
                </div>

                {/* Farewell Message Prose */}
                <div className="relative my-6 sm:my-8 px-2 sm:px-6">
                  <p className="text-base sm:text-xl leading-relaxed text-stone-800 font-serif italic text-center">
                    “{cardData.farewellMessage}”
                  </p>
                </div>

                {/* Sign-off & Sender Group */}
                <div className="text-center space-y-1 pt-4 border-t border-amber-300/60">
                  <p className="text-sm font-medium text-stone-600">{cardData.signOff}</p>
                  <p className="text-base sm:text-lg font-bold text-amber-900">
                    {cardData.senderGroup}
                  </p>
                </div>
              </>
            )}

            {/* Handwritten Student Signatures Grid */}
            <div className="mt-8 pt-6 border-t border-dashed border-amber-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold tracking-wider uppercase text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Student & Colleague Signatures ({cardData.studentSignatures.length})
                </h4>
                <span className="text-xs text-amber-700/70">From all your grateful students</span>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center">
                {cardData.studentSignatures.map((signature, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-1.5 bg-amber-200/40 hover:bg-amber-200/70 border border-amber-300/60 rounded-xl font-handwriting text-xl sm:text-2xl text-stone-800 shadow-xs transition-transform hover:scale-105 select-none"
                  >
                    {signature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Classroom Blessings / Interactive Toss Stickers */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Tap to Send Farewell Blessings & Stickers
              </p>
              <span className="text-xs text-stone-400">Interactive chimes & animations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => spawnReaction('💐')}
                className="py-2.5 px-3 bg-stone-700/50 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-600/60 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>💐</span>
                <span>Bouquet</span>
              </button>
              <button
                onClick={() => spawnReaction('🎓')}
                className="py-2.5 px-3 bg-stone-700/50 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-600/60 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🎓</span>
                <span>Graduation</span>
              </button>
              <button
                onClick={() => spawnReaction('🕊️')}
                className="py-2.5 px-3 bg-stone-700/50 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-600/60 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🕊️</span>
                <span>Next Journey</span>
              </button>
              <button
                onClick={() => spawnReaction('🍎')}
                className="py-2.5 px-3 bg-stone-700/50 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium border border-stone-600/60 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🍎</span>
                <span>Golden Apple</span>
              </button>
              <button
                onClick={() => {
                  triggerBirthdayBurst();
                  audioEngine.playPop();
                  spawnReaction('🎉');
                }}
                className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-medium border border-amber-500/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 col-span-2 sm:col-span-1 cursor-pointer"
              >
                <span>🎉</span>
                <span>Celebration Pop!</span>
              </button>
            </div>
          </div>

          {/* Add Student Signature Form */}
          <form
            onSubmit={handleAddSignature}
            className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80"
          >
            <div className="flex-1 w-full">
              <label htmlFor="student-name" className="block text-xs font-semibold text-stone-400 mb-1">
                Add Your Name or Tribute to the Card:
              </label>
              <input
                id="student-name"
                type="text"
                value={newSigner}
                onChange={(e) => setNewSigner(e.target.value)}
                placeholder="e.g. Maya Chen 💐 or The Science Club 🔬"
                className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-hidden focus:border-amber-400"
                maxLength={30}
              />
            </div>
            <button
              type="submit"
              disabled={!newSigner.trim()}
              className="w-full sm:w-auto px-5 py-2.5 mt-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Sign Card
            </button>
          </form>

          {/* Action Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenCustomizer) {
                    onClose();
                    onOpenCustomizer();
                  } else {
                    setIsEditingInline(true);
                  }
                }}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Wishes</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Direct Share to WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 fill-stone-950" />
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Direct Share to Telegram"
              >
                <TelegramIcon className="w-4 h-4 fill-white" />
                <span>Telegram</span>
              </a>

              <button
                onClick={handleShare}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Link with Surprise Code"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onOpenCalendar}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Calendar</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-700 hover:bg-stone-600 text-white text-xs font-semibold rounded-xl transition-colors ml-auto cursor-pointer"
            >
              Back to 3D Box
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
