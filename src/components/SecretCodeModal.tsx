import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Key, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { triggerBirthdayBurst, triggerStarShower } from '../utils/confetti';
import { SECRET_ACCESS_CODE, setAccessCodeUnlocked } from '../utils/cardStorage';

interface SecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  teacherName: string;
  senderGroup: string;
}

export const SecretCodeModal: React.FC<SecretCodeModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  teacherName,
  senderGroup,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsSuccess(false);
      // Auto-focus hidden input for smooth mobile & desktop keyboard typing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitPress = (digit: string) => {
    if (isSuccess || pin.length >= 5) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    audioEngine.playChime(600 + nextPin.length * 100, 0, 0.1);

    if (nextPin.length === 5) {
      verifyCode(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isSuccess || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
    audioEngine.playPop();
  };

  const verifyCode = (codeToTest: string) => {
    if (codeToTest === SECRET_ACCESS_CODE) {
      setIsSuccess(true);
      setErrorMsg('');
      setAccessCodeUnlocked(true);
      audioEngine.playChime(880, 0, 0.3);
      audioEngine.playFanfare();
      triggerBirthdayBurst();
      triggerStarShower();

      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 900);
    } else {
      setErrorMsg('Incorrect code. Please enter 12345');
      audioEngine.playPop();
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleQuickUnlock = () => {
    setPin(SECRET_ACCESS_CODE);
    verifyCode(SECRET_ACCESS_CODE);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigitPress(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Invisible input to capture physical keyboard / mobile IME */}
      <input
        ref={inputRef}
        type="tel"
        maxLength={5}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 5);
          setPin(val);
          if (val.length === 5) verifyCode(val);
        }}
        className="opacity-0 absolute pointer-events-none -top-10"
        aria-hidden="true"
      />

      <div
        className="w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-stone-100 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Header Icon */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 mb-1 shadow-lg shadow-amber-500/10">
            {isSuccess ? (
              <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 text-amber-400" />
            )}
          </div>

          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
            {senderGroup}
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            Enter Secret Access Code
          </h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Unlock the 3D keepsake farewell surprise for{' '}
            <strong className="text-amber-300 font-bold">{teacherName}</strong>
          </p>
        </div>

        {/* 5-Box PIN Display */}
        <div className="flex justify-center gap-2.5 sm:gap-3 py-2">
          {[0, 1, 2, 3, 4].map((index) => {
            const digit = pin[index];
            const isFilled = digit !== undefined;
            return (
              <div
                key={index}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-black font-mono transition-all duration-200 border-2 ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 scale-105 shadow-lg shadow-emerald-500/20'
                    : isFilled
                      ? 'border-amber-400 bg-amber-400/15 text-white scale-102 shadow-md shadow-amber-400/20'
                      : 'border-stone-700 bg-stone-800/60 text-stone-500'
                }`}
              >
                {isFilled ? digit : '•'}
              </div>
            );
          })}
        </div>

        {/* Status / Error feedback */}
        <div className="min-h-6 text-center text-xs">
          {isSuccess ? (
            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Access Granted! Unboxing 3D Keepsake...
            </span>
          ) : errorMsg ? (
            <span className="text-rose-400 font-semibold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </span>
          ) : (
            <span className="text-stone-400 flex items-center justify-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Enter the 5-digit code (Hint: <strong className="text-amber-300 font-bold">12345</strong>)
            </span>
          )}
        </div>

        {/* On-Screen Keypad for Mobile / Mouse */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigitPress(d)}
              className="py-3 sm:py-3.5 bg-stone-800/80 hover:bg-stone-700 text-white font-bold text-lg rounded-2xl border border-stone-700/80 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 sm:py-3.5 bg-stone-800/50 hover:bg-stone-800 text-stone-400 hover:text-white font-semibold text-xs uppercase tracking-wider rounded-2xl border border-stone-700/60 transition-all active:scale-95 cursor-pointer"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="py-3 sm:py-3.5 bg-stone-800/80 hover:bg-stone-700 text-white font-bold text-lg rounded-2xl border border-stone-700/80 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="py-3 sm:py-3.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-amber-500/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            title="Auto-enter 12345"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>12345</span>
          </button>
        </div>

        {/* Quick Help / Direct unlock footer */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-400">Secret Code: <strong className="text-amber-400">12345</strong></span>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Unlock Now
          </button>
        </div>
      </div>
    </div>
  );
};
