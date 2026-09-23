import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Google Calendar Workspace scopes
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/calendar');

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// In-memory cache for access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not in memory; user needs to interact to obtain fresh credential
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleCalendar = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Calendar access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Calendar Google sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCalendarAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const calendarLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface FarewellEventPayload {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string; // ISO string e.g. "2026-10-15T14:00:00"
  endDateTime: string;   // ISO string e.g. "2026-10-15T16:00:00"
  timeZone?: string;
}

export interface CreatedCalendarEvent {
  id: string;
  summary: string;
  htmlLink: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

/**
 * Creates an event in the user's primary Google Calendar via the Google Calendar REST API v3
 */
export const createTeacherFarewellCalendarEvent = async (
  payload: FarewellEventPayload
): Promise<CreatedCalendarEvent> => {
  const token = await getCalendarAccessToken();
  if (!token) {
    throw new Error('Google Calendar access token not available. Please sign in with Google first.');
  }

  const timeZone = payload.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const body = {
    summary: payload.summary,
    description: payload.description,
    location: payload.location || 'School Auditorium / Classroom',
    start: {
      dateTime: payload.startDateTime,
      timeZone,
    },
    end: {
      dateTime: payload.endDateTime,
      timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.error?.message || `HTTP ${res.status}: Failed to create Google Calendar event`;
    throw new Error(msg);
  }

  return await res.json();
};
