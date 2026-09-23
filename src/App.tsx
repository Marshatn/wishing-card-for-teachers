/**
 * 3D Teacher Farewell Keepsake Card - Farewell & Thank You Teacher!
 * Interactive 3D keepsake present box with celebratory bursting confetti,
 * pop-out 3D greeting card, the touching "Auld Lang Syne" farewell melody,
 * student signatures, tributes, Google Calendar event scheduling,
 * and direct sharing to WhatsApp & Telegram with surprise code xcc5305-SURPRISE!!
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ThreePresentScene } from './components/ThreePresentScene';
import { CardReaderModal } from './components/CardReaderModal';
import { CardCustomizer } from './components/CardCustomizer';
import { CalendarSchedulerModal } from './components/CalendarSchedulerModal';
import { SecretCodeModal } from './components/SecretCodeModal';
import {
  ShareModal,
  WhatsAppIcon,
  TelegramIcon,
  SHORT_WISH_ID,
  SECRET_ACCESS_CODE,
} from './components/ShareModal';
import {
  loadInitialCardData,
  saveCardData,
  getShareableSurpriseUrl,
  getShortSurpriseUrl,
  isAccessCodeUnlocked,
  setAccessCodeUnlocked,
  SURPRISE_CODE,
} from './utils/cardStorage';
import {
  DEFAULT_CARD_DATA,
  PRESENT_THEMES,
  PresentTheme,
  TeacherCardData,
  FAREWELL_SONGS,
} from './types/card';
import { audioEngine } from './utils/audio';
import { triggerBirthdayBurst, triggerStarShower } from './utils/confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
  Eye,
  Gift,
  Music,
  Calendar,
  Award,
  ChevronRight,
  RefreshCw,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';

export default function App() {
  const [cardData, setCardData] = useState<TeacherCardData>(() => loadInitialCardData().data);
  const [isOpen, setIsOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSecretCodeModalOpen, setIsSecretCodeModalOpen] = useState(false);
  const [isCodeUnlocked, setIsCodeUnlocked] = useState<boolean>(() => isAccessCodeUnlocked());
  const [isSurpriseUnlocked, setIsSurpriseUnlocked] = useState(false);
  const [copiedSurpriseLink, setCopiedSurpriseLink] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Active theme
  const currentTheme = useMemo<PresentTheme>(() => {
    return PRESENT_THEMES.find((t) => t.id === cardData.themeId) || PRESENT_THEMES[0];
  }, [cardData.themeId]);

  // Current active song option
  const activeSong = useMemo(() => {
    return (
      FAREWELL_SONGS.find((s) => s.id === cardData.selectedSongId) || FAREWELL_SONGS[0]
    );
  }, [cardData.selectedSongId]);

  // Handler to update card data and save to localStorage
  const handleUpdateCardData = useCallback((updated: TeacherCardData) => {
    setCardData(updated);
    saveCardData(updated);
  }, []);

  // Short URL and share messages
  const shortSurpriseUrl = useMemo(() => getShortSurpriseUrl(false), []);
  const directUnlockUrl = useMemo(() => getShortSurpriseUrl(true), []);
  const shareMessage = `🎁 SURPRISE! A 3D Farewell Keepsake Present has been prepared for ${cardData.teacherName} from ${cardData.senderGroup}!\n\n🔗 Short Link: ${shortSurpriseUrl}\n🔑 Secret Access Code: ${SECRET_ACCESS_CODE}\n\nTap to open the 3D keepsake and hear the farewell melody!`;
  const directWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const directTelegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shortSurpriseUrl)}&text=${encodeURIComponent(`🎁 SURPRISE! 3D Farewell Keepsake for ${cardData.teacherName} (Secret Code: ${SECRET_ACCESS_CODE})`)}`;

  // Detect surprise code & secret access code on initial page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      const passParam = params.get('pass') || params.get('pin') || params.get('secret');
      const wishParam = params.get('wish');
      const fullHref = window.location.href;

      const hasDirectCode =
        codeParam === SECRET_ACCESS_CODE ||
        passParam === SECRET_ACCESS_CODE ||
        codeParam === SHORT_WISH_ID ||
        fullHref.includes('12345') ||
        fullHref.includes('xcc5305-SURPRISE');

      if (hasDirectCode) {
        setIsCodeUnlocked(true);
        setAccessCodeUnlocked(true);
        setIsSurpriseUnlocked(true);
        // Automatically pop open the keepsake present with fanfare and confetti
        const timer = setTimeout(() => {
          setIsOpen(true);
          triggerBirthdayBurst();
          audioEngine.playPop();
          audioEngine.playFanfare();
          if (!audioEngine.getMuted()) {
            setIsPlayingMusic(true);
            audioEngine.playFarewellSong(cardData.selectedSongId, () => {
              setIsPlayingMusic(false);
            });
          }
        }, 700);
        return () => clearTimeout(timer);
      } else if (wishParam === SHORT_WISH_ID || fullHref.includes(SHORT_WISH_ID)) {
        // Came via short link! Prompt code modal if not yet unlocked
        if (!isAccessCodeUnlocked()) {
          const timer = setTimeout(() => {
            setIsSecretCodeModalOpen(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [cardData.selectedSongId]);

  // Unlock callback when code 12345 is verified
  const handleUnlockSuccess = useCallback(() => {
    setIsCodeUnlocked(true);
    setIsSurpriseUnlocked(true);
    setAccessCodeUnlocked(true);
    setIsOpen(true);
    audioEngine.playWhoosh();
    setTimeout(() => {
      audioEngine.playPop();
      triggerBirthdayBurst();
      audioEngine.playFanfare();
      if (!audioEngine.getMuted()) {
        setIsPlayingMusic(true);
        audioEngine.playFarewellSong(cardData.selectedSongId, () => {
          setIsPlayingMusic(false);
        });
      }
    }, 350);
  }, [cardData.selectedSongId]);

  // Open/Close present handler with celebratory audio & confetti
  const handleTogglePresent = useCallback(() => {
    setHasInteracted(true);
    if (!isOpen) {
      if (!isCodeUnlocked) {
        setIsSecretCodeModalOpen(true);
        return;
      }
      // Opening sequence
      setIsOpen(true);
      audioEngine.playWhoosh();
      setTimeout(() => {
        audioEngine.playPop();
        triggerBirthdayBurst();
        audioEngine.playFanfare();
        // Play the chosen farewell song (Auld Lang Syne)
        if (!audioEngine.getMuted()) {
          setIsPlayingMusic(true);
          audioEngine.playFarewellSong(cardData.selectedSongId, () => {
            setIsPlayingMusic(false);
          });
        }
      }, 350);
    } else {
      // Closing sequence
      setIsOpen(false);
      audioEngine.stopFarewellSong();
      setIsPlayingMusic(false);
      audioEngine.playWhoosh();
    }
  }, [isOpen, isCodeUnlocked, cardData.selectedSongId]);

  // Burst confetti manually anytime
  const handleBurstConfetti = () => {
    triggerBirthdayBurst();
    audioEngine.playPop();
  };

  // Toggle background music / farewell tune
  const handleToggleMusic = () => {
    if (isPlayingMusic) {
      audioEngine.stopFarewellSong();
      setIsPlayingMusic(false);
    } else {
      setIsPlayingMusic(true);
      if (isMuted) {
        audioEngine.setMuted(false);
        setIsMuted(false);
      }
      audioEngine.playFarewellSong(cardData.selectedSongId, () => {
        setIsPlayingMusic(false);
      });
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
    if (nextMuted) {
      setIsPlayingMusic(false);
    }
  };

  // Add new student signature
  const handleAddSignature = (name: string) => {
    setCardData((prev) => {
      const updated = {
        ...prev,
        studentSignatures: [...prev.studentSignatures, name],
      };
      saveCardData(updated);
      return updated;
    });
  };

  // Quick Copy Surprise Link
  const handleCopySurpriseUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortSurpriseUrl);
      setCopiedSurpriseLink(true);
      audioEngine.playChime(880, 0, 0.2);
      triggerStarShower();
      setTimeout(() => setCopiedSurpriseLink(false), 2600);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950 overflow-x-hidden">
      {/* 1. TOP BAR CONTRACT */}
      <header className="h-16 border-b border-stone-800/80 bg-stone-950/85 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Brand */}
        <a
          href="/"
          className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight text-white font-display shrink-0"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm shadow-sm">
            🎓
          </span>
          <span className="truncate hidden xs:inline">Farewell Teacher</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-300">
          <button
            onClick={() => setIsReaderOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Read Keepsake
          </button>

          <button
            onClick={() => setIsCalendarOpen(true)}
            className="hover:text-amber-300 text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="hover:text-amber-300 text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title={`Share link with ${SURPRISE_CODE}`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Share ({SURPRISE_CODE})</span>
          </button>

          <button
            onClick={handleBurstConfetti}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Confetti</span>
          </button>

          <button
            onClick={handleToggleMusic}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title={`Current: ${activeSong.title}`}
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeSong.title}</span>
            {isPlayingMusic && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </nav>

        {/* Zone 3: Direct WhatsApp / Telegram Icons & Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Secret Code status / entry button */}
          {!isCodeUnlocked ? (
            <button
              onClick={() => setIsSecretCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl border border-amber-500/40 transition-all cursor-pointer shadow-xs animate-pulse"
              title="Enter Secret Code 12345 to Unlock Present"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Code: 12345</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSecretCodeModalOpen(true)}
              className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors cursor-pointer"
              title="Secret Access Code 12345 is Active & Verified"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>12345</span>
            </button>
          )}

          {/* Direct WhatsApp Share Icon */}
          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-stone-950 border border-[#25D366]/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Direct Share to WhatsApp with Secret Code"
            aria-label="Direct Share to WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Direct Telegram Share Icon */}
          <a
            href={directTelegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Direct Share to Telegram with Secret Code"
            aria-label="Direct Share to Telegram"
          >
            <TelegramIcon className="w-4 h-4 fill-current shrink-0" />
            <span className="hidden sm:inline">Telegram</span>
          </a>

          {/* Share Modal Trigger */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
            title={`Share Short Link (${SHORT_WISH_ID}) & Code 12345`}
            aria-label="Share options"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Mute button */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-stone-300" />
            )}
          </button>

          {/* Customize / Edit Wishes Button - visible on all screens */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-xl border border-amber-500/40 transition-all cursor-pointer shadow-xs"
            title="Edit Wishes, Teacher Name & Music"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Edit Wishes</span>
          </button>

          {/* Primary CTA: Open/Close Box */}
          <button
            onClick={handleTogglePresent}
            className="px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>{isOpen ? 'Close' : 'Open'}</span>
          </button>
        </div>
      </header>

      {/* Surprise Link Notification Banner when opened via surprise code */}
      {isSurpriseUnlocked && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-stone-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4 animate-spin text-stone-950" />
            <span>
              Special Keepsake Unlocked! Short Link:{' '}
              <span className="font-mono bg-stone-950/20 px-2 py-0.5 rounded-md">
                {SHORT_WISH_ID}
              </span>{' '}
              · Secret Code:{' '}
              <span className="font-mono bg-stone-950/20 px-2 py-0.5 rounded-md">
                {SECRET_ACCESS_CODE}
              </span>
            </span>
          </div>
          <button
            onClick={() => {
              triggerBirthdayBurst();
              audioEngine.playFanfare();
            }}
            className="px-2.5 py-1 bg-stone-950 text-amber-300 rounded-lg text-xs hover:bg-stone-900 transition-colors shrink-0 ml-2 cursor-pointer"
          >
            Burst Confetti 🎉
          </button>
        </div>
      )}

      {/* 2. HERO / 3D CANVAS VIEWPORT AREA */}
      <main className="flex-1 flex flex-col relative w-full overflow-hidden">
        {/* Ambient celebratory background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-1000 opacity-25"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${currentTheme.accentHex} 0%, transparent 65%)`,
          }}
        />

        {/* Subdued Editorial Header Overlay */}
        <div className="absolute top-4 left-4 right-4 sm:left-8 sm:right-8 z-20 flex flex-col sm:flex-row sm:items-center justify-between pointer-events-none gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-400/90 mb-1">
              <span>Teacher's Farewell Keepsake</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-300">
                <Music className="w-3 h-3" /> {activeSong.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">SJK (C) Chung Hwa Kota Belud</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight drop-shadow-md">
              Farewell & Thank You, Teacher!
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Honoring <span className="font-semibold text-stone-200">{cardData.teacherName}</span> — Click or tap the keepsake box to open and hear the farewell melody
            </p>
          </div>

          {/* Quick Status / Hint CTA */}
          <div className="pointer-events-auto flex items-center gap-2 self-start sm:self-auto">
            {!isOpen ? (
              <button
                onClick={handleTogglePresent}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900/90 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg animate-pulse hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tap Present to Open & Play Song</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReaderOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-400/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Full Card & Signatures</span>
                </button>
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3D WebGL Canvas Component Container */}
        <div className="relative w-full h-[65vh] sm:h-[72vh] flex items-center justify-center">
          <ThreePresentScene
            isOpen={isOpen}
            onToggleOpen={handleTogglePresent}
            theme={currentTheme}
            teacherName={cardData.teacherName}
            schoolName={cardData.senderGroup}
            autoRotate={autoRotate}
          />

          {/* Floating 3D Interaction Control HUD (Frosted Floating Toolbar) */}
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-2 p-1.5 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl shadow-xl max-w-[95vw] overflow-x-auto">
            {/* Secret Code button in HUD */}
            {!isCodeUnlocked && (
              <button
                onClick={() => setIsSecretCodeModalOpen(true)}
                className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 animate-pulse"
                title="Enter Secret Code 12345 to Unlock"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter 12345</span>
              </button>
            )}

            <button
              onClick={handleTogglePresent}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOpen
                  ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  : 'bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 shadow-sm'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{isOpen ? 'Close' : 'Open'}</span>
            </button>

            <button
              onClick={handleBurstConfetti}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Burst More Confetti"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Burst Confetti</span>
            </button>

            <button
              onClick={() => setIsReaderOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/60 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Inspect Card Details"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Read Card</span>
            </button>

            {/* Edit Wishes in 3D HUD */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Edit Wishes & Teacher Name"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Edit Wishes</span>
            </button>

            {/* Direct WhatsApp Share button in 3D HUD */}
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-xs bg-[#25D366] text-stone-950 font-bold hover:brightness-110 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0 shadow-sm"
              title="Direct Share to WhatsApp with Surprise Code"
            >
              <WhatsAppIcon className="w-4 h-4 fill-stone-950" />
            </a>

            {/* Direct Telegram Share button in 3D HUD */}
            <a
              href={directTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-xs bg-[#229ED9] text-white font-bold hover:brightness-110 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0 shadow-sm"
              title="Direct Share to Telegram with Surprise Code"
            >
              <TelegramIcon className="w-4 h-4 fill-white" />
            </a>

            {/* Share Modal Trigger in HUD */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl text-xs bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700/60 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title={`Share URL with ${SURPRISE_CODE}`}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMusic}
              className={`p-2 rounded-xl text-xs border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                isPlayingMusic
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border-stone-700/60'
              }`}
              title={isPlayingMusic ? `Stop ${activeSong.title}` : `Play ${activeSong.title}`}
            >
              <Music
                className={`w-4 h-4 ${
                  isPlayingMusic ? 'animate-bounce text-amber-400' : ''
                }`}
              />
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl text-xs border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                autoRotate
                  ? 'bg-stone-800 text-amber-400 border-stone-700/60'
                  : 'bg-stone-800 text-stone-400 border-stone-700/60'
              }`}
              title={autoRotate ? 'Pause 360° Rotation' : 'Resume 360° Rotation'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRotate ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Quick Hint Tooltip for First Time Users */}
          {!hasInteracted && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center animate-bounce">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 border border-white/20 text-white text-xs font-semibold shadow-lg">
                <span>👆</span> Click Box to Untie Ribbon & Hear Farewell Song
              </span>
            </div>
          )}
        </div>

        {/* 3. CARD PREVIEW & CLASSROOM TRIBUTE SECTION */}
        <section className="border-t border-stone-800/80 bg-stone-900/60 px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Farewell Tribute & Classroom Dedication
                </span>
                <h2 className="text-2xl font-bold font-display text-white mt-1">
                  Honoring {cardData.teacherName}'s Inspiring Legacy
                </h2>
                <p className="text-sm text-stone-400 max-w-2xl mt-1">
                  Though you are stepping into a new chapter, your wisdom, kindness, and encouragement will forever stay in our hearts at SJK (C) Chung Hwa Kota Belud.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/40 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Edit Wishes & Teacher Name"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Wishes</span>
                </button>
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Surprise Link</span>
                </button>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Schedule in Calendar</span>
                </button>
                <button
                  onClick={() => setIsReaderOpen(true)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Inspect Card</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp & Telegram Quick Share Card Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Direct WhatsApp & Telegram Sharing
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/40">
                      {SURPRISE_CODE}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Send the 3D Unboxing Surprise to Teacher, Parents, and Classmates
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-0.5">
                    Click WhatsApp or Telegram to forward the interactive present with the surprise invitation code pre-attached!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-[#25D366]/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-stone-950" />
                    <span>Share to WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <a
                    href={directTelegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#229ED9]/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    <TelegramIcon className="w-4 h-4 fill-white" />
                    <span>Share to Telegram</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <button
                    onClick={handleCopySurpriseUrl}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedSurpriseLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1: The Farewell Note Preview */}
              <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400/90 tracking-wide uppercase">
                      Featured Farewell Message
                    </span>
                    <button
                      onClick={() => setIsCustomizerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Edit Wishes</span>
                    </button>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                    “Farewell & Thank You, {cardData.teacherName}!”
                  </h3>
                  <p className="text-stone-300 leading-relaxed text-sm sm:text-base italic font-serif">
                    “{cardData.farewellMessage}”
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">{cardData.senderGroup}</span>
                  <button
                    onClick={() => setIsReaderOpen(true)}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Add your tribute signature</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Farewell Soundtrack & Tribute Badges */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                      Farewell Song & Honors
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    {activeSong.badge}
                  </span>
                </div>

                {/* Song Banner */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      {activeSong.title}
                    </p>
                    <button
                      onClick={handleToggleMusic}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      {isPlayingMusic ? 'Pause' : 'Play'}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    {activeSong.description}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center gap-3">
                    <span className="text-xl">💐</span>
                    <div>
                      <p className="font-bold text-stone-200">Endless Gratitude</p>
                      <p className="text-stone-400">For shaping our minds and futures</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center gap-3">
                    <span className="text-xl">🎓</span>
                    <div>
                      <p className="font-bold text-stone-200">Teacher Hall of Fame</p>
                      <p className="text-stone-400">An extraordinary mentor never forgotten</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center gap-3">
                    <span className="text-xl">🕊️</span>
                    <div>
                      <p className="font-bold text-stone-200">Smooth Horizons</p>
                      <p className="text-stone-400">Best wishes on your next adventure</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBurstConfetti}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Celebration Confetti</span>
                </button>
              </div>
            </div>

            {/* Student Signatures Row */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Class Signatures & Tributes ({cardData.studentSignatures.length})
                  </h4>
                  <p className="text-xs text-stone-400">
                    Signed with love and admiration from your students at SJK (C) Chung Hwa Kota Belud
                  </p>
                </div>

                <button
                  onClick={() => setIsReaderOpen(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  + Add Your Signature
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {cardData.studentSignatures.map((sig, index) => (
                  <span
                    key={index}
                    className="px-3.5 py-1.5 bg-stone-800/90 text-stone-200 font-handwriting text-lg rounded-xl border border-stone-700/60 hover:border-amber-400/40 transition-colors select-none"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. MODALS & DRAWERS */}
      <CardReaderModal
        cardData={cardData}
        theme={currentTheme}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        onAddSignature={handleAddSignature}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={handleToggleMusic}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onUpdateCardData={handleUpdateCardData}
      />

      <CardCustomizer
        cardData={cardData}
        onUpdateCardData={handleUpdateCardData}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      <CalendarSchedulerModal
        cardData={cardData}
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        cardData={cardData}
      />

      <SecretCodeModal
        isOpen={isSecretCodeModalOpen}
        onClose={() => setIsSecretCodeModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
        teacherName={cardData.teacherName}
        senderGroup={cardData.senderGroup}
      />

      {/* 5. FOOTER */}
      <footer className="border-t border-stone-800/80 py-6 px-4 sm:px-8 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-950">
        <p>Interactive 3D Keepsake Card · Farewell & Thank You Teacher! · SJK (C) Chung Hwa Kota Belud</p>
        <div className="flex items-center gap-4 text-stone-400">
          <button
            onClick={() => setIsReaderOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Read Keepsake
          </button>
          <span aria-hidden="true">·</span>
          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#25D366] transition-colors cursor-pointer flex items-center gap-1"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={directTelegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#229ED9] transition-colors cursor-pointer flex items-center gap-1"
          >
            <TelegramIcon className="w-3.5 h-3.5 fill-current" />
            <span>Telegram</span>
          </a>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsShareOpen(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Share ({SURPRISE_CODE})
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Google Calendar
          </button>
        </div>
      </footer>
    </div>
  );
}
