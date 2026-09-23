import React, { useState, useEffect } from 'react';
import {
  TeacherCardData,
  DEFAULT_CARD_DATA,
  PRESENT_THEMES,
  MESSAGE_PRESETS,
  FAREWELL_SONGS,
} from '../types/card';
import {
  X,
  Palette,
  MessageSquare,
  User,
  Users,
  Check,
  Music,
  Play,
  Square,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { triggerStarShower } from '../utils/confetti';
import { audioEngine } from '../utils/audio';

interface CardCustomizerProps {
  cardData: TeacherCardData;
  onUpdateCardData: (updated: TeacherCardData) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CardCustomizer: React.FC<CardCustomizerProps> = ({
  cardData,
  onUpdateCardData,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<TeacherCardData>(cardData);
  const [newSignature, setNewSignature] = useState('');
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  // Initialize formData when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData(cardData);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time update handler: updates local state AND parent state (which writes to localStorage)
  const handleFieldChange = <K extends keyof TeacherCardData>(
    field: K,
    value: TeacherCardData[K]
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateCardData(updated);
    triggerAutoSaveIndicator();
  };

  const triggerAutoSaveIndicator = () => {
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const handleSave = () => {
    if (previewingSongId) {
      audioEngine.stopFarewellSong();
      setPreviewingSongId(null);
    }
    onUpdateCardData(formData);
    audioEngine.playChime(880, 0, 0.3);
    triggerStarShower();
    onClose();
  };

  const handleClose = () => {
    if (previewingSongId) {
      audioEngine.stopFarewellSong();
      setPreviewingSongId(null);
    }
    // Auto-save on close so user edits are NEVER lost
    onUpdateCardData(formData);
    onClose();
  };

  const handlePresetSelect = (text: string) => {
    handleFieldChange('farewellMessage', text);
  };

  const handleAddSig = () => {
    if (!newSignature.trim()) return;
    const updatedSignatures = [...formData.studentSignatures, newSignature.trim()];
    handleFieldChange('studentSignatures', updatedSignatures);
    setNewSignature('');
  };

  const handleRemoveSig = (index: number) => {
    const updatedSignatures = formData.studentSignatures.filter((_, i) => i !== index);
    handleFieldChange('studentSignatures', updatedSignatures);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset this keepsake back to the original SJK (C) Chung Hwa Kota Belud defaults?')) {
      setFormData(DEFAULT_CARD_DATA);
      onUpdateCardData(DEFAULT_CARD_DATA);
      audioEngine.playChime(659.25, 0, 0.2);
    }
  };

  const handleToggleSongPreview = (songId: string) => {
    if (previewingSongId === songId) {
      audioEngine.stopFarewellSong();
      setPreviewingSongId(null);
    } else {
      audioEngine.stopFarewellSong();
      setPreviewingSongId(songId);
      audioEngine.playFarewellSong(songId, () => {
        setPreviewingSongId(null);
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg h-full bg-stone-900 border-l border-stone-800 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slide-left text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-display">
                    Personalize Keepsake
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                    showSavedNotification
                      ? 'bg-emerald-400 text-stone-950 border-emerald-400 font-bold scale-105'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <Check className="w-3 h-3" />
                    {showSavedNotification ? 'Saved!' : 'Auto-saved'}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Custom message, best farewell song, & 3D colors
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Farewell Song Selector with Preview */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              Farewell Melody & Music Box Song
            </label>
            <p className="text-xs text-stone-400">
              Select the soundtrack that plays when the present box opens:
            </p>

            <div className="space-y-2">
              {FAREWELL_SONGS.map((song) => {
                const isSelected = formData.selectedSongId === song.id;
                const isPreviewing = previewingSongId === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      handleFieldChange('selectedSongId', song.id);
                      audioEngine.playChime(784, 0, 0.2);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                        : 'bg-stone-800/60 border-stone-700/60 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-amber-300' : 'text-stone-200'
                          }`}
                        >
                          {song.title}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-700 text-stone-300">
                          {song.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {song.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Play Preview button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSongPreview(song.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isPreviewing
                            ? 'bg-amber-400 text-stone-950 font-bold'
                            : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                        }`}
                        title={isPreviewing ? 'Stop Preview' : 'Listen to Preview'}
                      >
                        {isPreviewing ? (
                          <Square className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                        <span className="text-[10px]">
                          {isPreviewing ? 'Playing' : 'Listen'}
                        </span>
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Present Box & Card Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESENT_THEMES.map((theme) => {
                const isSelected = formData.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      handleFieldChange('themeId', theme.id);
                      audioEngine.playChime(659.25, 0, 0.15);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-stone-800 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                        : 'bg-stone-800/60 border-stone-700/60 hover:border-stone-600'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center border border-white/20 shrink-0"
                      style={{ backgroundColor: theme.boxColorCss }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accentHex }}
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">
                        {theme.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Title / Greeting */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Greeting / Title (Card Top Badge)
            </label>
            <input
              type="text"
              value={formData.recipientTitle}
              onChange={(e) => handleFieldChange('recipientTitle', e.target.value)}
              placeholder="e.g. Honoring Our Dear Teacher, 致最敬爱的老师"
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 font-medium"
            />
          </div>

          {/* Teacher Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Teacher's Name
            </label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => handleFieldChange('teacherName', e.target.value)}
              placeholder="e.g. Mrs. Anderson, Mr. Robert"
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Farewell Message Textarea & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Farewell Message
              </label>
              <div className="flex gap-1.5">
                <span className="text-[11px] text-stone-400">Presets:</span>
                {MESSAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.text)}
                    className="text-[10px] px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-md transition-colors cursor-pointer"
                    title={preset.subtitle}
                  >
                    {preset.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={formData.farewellMessage}
              onChange={(e) => handleFieldChange('farewellMessage', e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Sign-Off Line */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Sign-Off Greeting
            </label>
            <input
              type="text"
              value={formData.signOff}
              onChange={(e) => handleFieldChange('signOff', e.target.value)}
              placeholder="e.g. With deepest gratitude and endless love,"
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Sender Group */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              School / Sender Group
            </label>
            <input
              type="text"
              value={formData.senderGroup}
              onChange={(e) => handleFieldChange('senderGroup', e.target.value)}
              placeholder="e.g. SJK (C) Chung Hwa Kota Belud 🎓"
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Student Signatures List */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Signatures on the Card ({formData.studentSignatures.length})
            </label>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-stone-950/60 rounded-xl border border-stone-800">
              {formData.studentSignatures.map((sig, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 bg-stone-800 text-stone-200 text-xs rounded-lg flex items-center gap-1.5 border border-stone-700"
                >
                  <span>{sig}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSig(idx)}
                    className="text-stone-400 hover:text-rose-400 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSignature}
                onChange={(e) => setNewSignature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSig();
                  }
                }}
                placeholder="Add signature (e.g. Liam 🎓 or Grade 6)"
                className="flex-1 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddSig}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer save buttons */}
        <div className="pt-6 border-t border-stone-800 flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="text-stone-500 hover:text-stone-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset back to default SJK (C) Chung Hwa template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply & Celebrate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
