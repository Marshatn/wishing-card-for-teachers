import React, { useState } from 'react';
import {
  TeacherCardData,
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

  if (!isOpen) return null;

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

  const handlePresetSelect = (text: string) => {
    setFormData((prev) => ({ ...prev, farewellMessage: text }));
  };

  const handleAddSig = () => {
    if (!newSignature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      studentSignatures: [...prev.studentSignatures, newSignature.trim()],
    }));
    setNewSignature('');
  };

  const handleRemoveSig = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      studentSignatures: prev.studentSignatures.filter((_, i) => i !== index),
    }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
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
                <h3 className="text-lg font-bold text-white font-display">
                  Personalize Farewell Keepsake
                </h3>
                <p className="text-xs text-stone-400">
                  Custom message, best farewell song, & 3D colors
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (previewingSongId) {
                  audioEngine.stopFarewellSong();
                }
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors"
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
                      setFormData((prev) => ({ ...prev, selectedSongId: song.id }));
                      audioEngine.playChime(784, 0, 0.2);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-sm shadow-amber-500/10'
                        : 'border-stone-800 bg-stone-800/40 hover:bg-stone-800/70 text-stone-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{song.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                          {song.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {song.artistDesc}
                      </p>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {song.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSongPreview(song.id);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isPreviewing
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                            : 'bg-stone-700/80 hover:bg-stone-700 text-stone-200'
                        }`}
                        title={isPreviewing ? 'Stop Preview' : 'Play Audio Preview'}
                      >
                        {isPreviewing ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-stone-950" />
                            <span className="text-[11px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[11px]">Preview</span>
                          </>
                        )}
                      </button>

                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Present Box Theme Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Present Box Colors & Ribbon Finish
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESENT_THEMES.map((th) => {
                const isSelected = formData.themeId === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, themeId: th.id }));
                      audioEngine.playChime(659.25, 0, 0.2);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                        : 'border-stone-800 bg-stone-800/40 hover:bg-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex -space-x-1 shrink-0">
                      <div
                        className="w-5 h-5 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: th.boxColorCss }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: th.ribbonColorCss }}
                      />
                    </div>
                    <span className="text-xs font-medium truncate flex-1">{th.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teacher Recipient Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Teacher's Name
            </label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              placeholder="e.g. Mrs. Anderson or Mr. Davis"
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Teacher Honorific Subtitle */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Card Recipient Honorific / Subtitle
            </label>
            <input
              type="text"
              value={formData.recipientTitle}
              onChange={(e) => setFormData({ ...formData, recipientTitle: e.target.value })}
              placeholder="e.g. To Our Beloved Mentor & Teacher"
              className="w-full px-4 py-2 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Farewell Message with Quick Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Heartfelt Farewell Message
              </label>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-stone-400">Quick farewell templates:</span>
              <div className="flex flex-wrap gap-1.5">
                {MESSAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.text)}
                    className="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 transition-colors"
                  >
                    {preset.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={formData.farewellMessage}
              onChange={(e) => setFormData({ ...formData, farewellMessage: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Sender Group */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Class / Sender Group
            </label>
            <input
              type="text"
              value={formData.senderGroup}
              onChange={(e) => setFormData({ ...formData, senderGroup: e.target.value })}
              placeholder="e.g. Forever Your Students — Class of 2026 🎓"
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
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 rounded-lg text-xs text-stone-200 border border-stone-700"
                >
                  <span>{sig}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSig(idx)}
                    className="text-stone-400 hover:text-rose-400 ml-1"
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
                placeholder="Add signature (e.g. Liam 🎓 or Grade 10)"
                className="flex-1 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddSig}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs font-medium text-white transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer save buttons */}
        <div className="pt-6 border-t border-stone-800 flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              if (previewingSongId) {
                audioEngine.stopFarewellSong();
              }
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            Save & Update Present
          </button>
        </div>
      </div>
    </div>
  );
};
