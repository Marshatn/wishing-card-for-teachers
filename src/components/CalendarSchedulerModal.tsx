import React, { useState, useEffect } from 'react';
import { TeacherCardData } from '../types/card';
import {
  initCalendarAuth,
  signInWithGoogleCalendar,
  calendarLogout,
  createTeacherFarewellCalendarEvent,
  CreatedCalendarEvent,
  getCalendarAccessToken,
} from '../utils/googleCalendar';
import { User } from 'firebase/auth';
import { audioEngine } from '../utils/audio';
import { triggerBirthdayBurst, triggerStarShower } from '../utils/confetti';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  X,
  AlertCircle,
  Loader2,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

interface CalendarSchedulerModalProps {
  cardData: TeacherCardData;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarSchedulerModal: React.FC<CalendarSchedulerModalProps> = ({
  cardData,
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CreatedCalendarEvent | null>(null);

  // Form Fields
  const [eventTitle, setEventTitle] = useState(
    `Farewell Gathering for ${cardData.teacherName} 💐🎓`
  );
  // Default to Friday or 2 days ahead at 14:00
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [eventDate, setEventDate] = useState(getDefaultDate());
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [location, setLocation] = useState('School Main Auditorium / Classroom 4B');
  const [notes, setNotes] = useState(
    `Honoring ${cardData.teacherName}'s inspirational years of teaching with speeches, gift box unboxing, card signing, and tea!\n\nMessage from students:\n"${cardData.farewellMessage}"\n\n${cardData.senderGroup}`
  );

  // Listen to auth state
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        getCalendarAccessToken().then((t) => {
          setHasToken(!!t);
        });
      }
    );

    getCalendarAccessToken().then((t) => setHasToken(!!t));

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Update defaults if teacher name changes
  useEffect(() => {
    setEventTitle(`Farewell Celebration for ${cardData.teacherName} 💐🎓`);
  }, [cardData.teacherName]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMsg(null);
      const res = await signInWithGoogleCalendar();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        audioEngine.playChime(1046.5, 0, 0.35);
        triggerStarShower();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await calendarLogout();
    setCurrentUser(null);
    setHasToken(false);
    setCreatedEvent(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasToken) {
      setErrorMsg('Please sign in with Google first to authorize Google Calendar.');
      return;
    }

    try {
      setIsCreatingEvent(true);
      setErrorMsg(null);

      const startIso = `${eventDate}T${startTime}:00`;
      const endIso = `${eventDate}T${endTime}:00`;

      const result = await createTeacherFarewellCalendarEvent({
        summary: eventTitle,
        description: notes,
        location,
        startDateTime: startIso,
        endDateTime: endIso,
      });

      setCreatedEvent(result);
      audioEngine.playFanfare();
      triggerBirthdayBurst();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not create Google Calendar event. Check permissions or try signing in again.';
      setErrorMsg(msg);
      if (msg.includes('401') || msg.includes('token')) {
        setHasToken(false);
      }
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl my-auto rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900 text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-sky-600/20 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-amber-400">
                Google Calendar Integration
              </p>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Schedule Teacher's Farewell Event
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* User Auth Status Banner */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {currentUser && hasToken ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-amber-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-stone-400">Connected to Google Calendar:</p>
                  <p className="text-sm font-semibold text-white">
                    {currentUser.displayName || currentUser.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Connect Your Google Calendar
                </p>
                <p className="text-xs text-stone-400 max-w-sm">
                  Sign in with Google to add the Farewell Gathering and reminders directly to your primary calendar.
                </p>
              </div>
            )}

            <div>
              {currentUser && hasToken ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 border border-stone-800 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                /* Official Sign in with Google Button as mandated by Workspace Integration */
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner if Event Created */}
          {createdEvent && (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Farewell Event Added to Google Calendar!
                </h4>
              </div>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                “{createdEvent.summary}” has been scheduled on {eventDate} from {startTime} to{' '}
                {endTime}. Invitations and reminders have been configured.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={createdEvent.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Open in Google Calendar ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* Event Form */}
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Celebration Location / Room
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. School Auditorium / Teacher's Lounge / Classroom"
                className="w-full px-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Calendar Event Notes & Classroom Tribute
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs leading-relaxed focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreatingEvent || !hasToken}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingEvent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Adding to Calendar...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>Save to Google Calendar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
