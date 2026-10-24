import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from './supabase';

const ALLOWED_DOMAIN = 'southshore.edu.gh';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);       // auth.users row (supabase Session.user)
  const profile = ref(null);    // public.users row
  const isLoading = ref(false);
  const error = ref('');
  let initialized = false;

  /**
   * Call once at app startup. Restores any existing session and keeps
   * `user`/`profile` in sync with future auth state changes.
   */
  async function initialize() {
    if (initialized) return;
    initialized = true;

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      user.value = data.session.user;
      await fetchProfile();
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null;
      if (user.value) {
        await fetchProfile();
      } else {
        profile.value = null;
      }
    });
  }

  /**
   * Resolves a user's login input (email, staff ID, student ID, or username)
   * to their registered email address.
   */
  async function resolveLoginEmail(loginId) {
    if (!loginId || typeof loginId !== 'string') return null;
    const clean = loginId.trim();
    if (!clean) return null;

    // 1. If already in standard email format, normalize and return
    if (clean.includes('@')) {
      return clean.toLowerCase();
    }

    // 2. Try Supabase RPC get_login_email function
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_login_email', {
        p_login_id: clean,
      });
      if (!rpcErr && data && typeof data === 'string' && data.includes('@')) {
        return data.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('RPC get_login_email notice:', e);
    }

    const candidateEmail = `${clean.toLowerCase()}@${ALLOWED_DOMAIN}`;

    // 3. Fallback: Query public.users directly for matching id_number, id, or email candidate
    try {
      const { data: byIdNumber } = await supabase
        .from('users')
        .select('email')
        .ilike('id_number', clean)
        .limit(1)
        .maybeSingle();

      if (byIdNumber?.email) {
        return byIdNumber.email.trim().toLowerCase();
      }

      const { data: byOther } = await supabase
        .from('users')
        .select('email')
        .or(`id.eq.${clean},email.ilike.${candidateEmail}`)
        .limit(1)
        .maybeSingle();

      if (byOther?.email) {
        return byOther.email.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('public.users direct lookup notice:', e);
    }

    // 4. If alphanumeric username without domain (e.g. "s.amoah" or "kwame"), try candidate
    if (/^[a-zA-Z0-9._-]+$/.test(clean)) {
      return candidateEmail;
    }

    return null;
  }

  async function fetchProfile() {
    if (!user.value) return null;

    try {
      // 1. Primary lookup: by authenticated user UUID
      let { data, error: fetchErr } = await supabase
        .from('users')
        .select('*, programmes!users_program_id_fkey(id, name, degree_abbreviation, level)')
        .eq('id', user.value.id)
        .maybeSingle();

      // Fallback without foreign-key join if relationship fails
      if (fetchErr || !data) {
        const simple = await supabase
          .from('users')
          .select('*')
          .eq('id', user.value.id)
          .maybeSingle();
        if (simple.data) {
          data = simple.data;
        }
      }

      // 2. Secondary lookup: by verified email (in case profile has legacy/placeholder ID)
      if (!data && user.value.email) {
        const cleanEmail = user.value.email.trim().toLowerCase();
        let { data: byEmail } = await supabase
          .from('users')
          .select('*, programmes!users_program_id_fkey(id, name, degree_abbreviation, level)')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (!byEmail) {
          const simpleEmail = await supabase
            .from('users')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();
          byEmail = simpleEmail.data;
        }

        if (byEmail) {
          data = byEmail;
          // Synchronize/link public.users.id to match the verified Supabase Auth user UUID
          if (byEmail.id !== user.value.id) {
            try {
              const { error: linkErr } = await supabase
                .from('users')
                .update({ id: user.value.id, updated_at: new Date().toISOString() })
                .eq('id', byEmail.id);
              if (!linkErr) {
                data.id = user.value.id;
              }
            } catch (linkNotice) {
              console.warn('Profile ID synchronization notice:', linkNotice);
            }
          }
        }
      }

      // 3. Fallback: if user is authenticated in Supabase Auth but public.users row is missing,
      // create it automatically from Auth metadata so the user is never stranded
      if (!data && user.value) {
        const meta = user.value.user_metadata || {};
        const fallbackProfile = {
          id: user.value.id,
          email: user.value.email.toLowerCase(),
          name: meta.full_name || meta.name || user.value.email.split('@')[0],
          role: meta.role || 'Lecturer',
          id_number: meta.id_number || null,
          employment_type: meta.employment_type || 'Full-Time',
          program: meta.program || null,
        };

        try {
          const { data: inserted, error: insertErr } = await supabase
            .from('users')
            .insert(fallbackProfile)
            .select()
            .maybeSingle();
          data = (!insertErr && inserted) ? inserted : fallbackProfile;
        } catch {
          data = fallbackProfile;
        }
      }

      profile.value = data;
      return data;
    } catch (e) {
      console.error('fetchProfile unexpected error:', e);
      return null;
    }
  }

  /**
   * loginId can be either the full institutional email or the
   * user's Student/Staff ID number.
   */
  async function login({ loginId, password }) {
    isLoading.value = true;
    error.value = '';

    const cleanInput = (loginId || '').trim();
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanInput || !cleanPassword) {
      const msg = 'Please enter both your institutional ID/email and password.';
      error.value = msg;
      isLoading.value = false;
      throw new Error(msg);
    }

    // Pre-login cleanup: purge stale course context & cached keys
    const staleKeys = [
      'userId', 'userRole', 'userEmail', 'user', 'token',
      'activeCourseId', 'activeCourseCode', 'activeCourseName',
      'activeCourseSemester', 'activeCourseMode',
    ];
    staleKeys.forEach((k) => localStorage.removeItem(k));

    try {
      const resolvedEmail = await resolveLoginEmail(cleanInput);

      if (!resolvedEmail) {
        const err = new Error(
          `No account found matching Institutional ID "${cleanInput}". Please check your ID number or log in using your university email address.`
        );
        err.code = 'UNKNOWN_ID';
        throw err;
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: cleanPassword,
      });

      if (signInErr) {
        // 1. Email confirmation pending
        if (signInErr.message === 'Email not confirmed') {
          const err = new Error(
            'Please confirm your email address before signing in — check your inbox for the confirmation link.'
          );
          err.code = 'EMAIL_NOT_CONFIRMED';
          err.email = resolvedEmail;
          throw err;
        }

        // 2. Invalid credentials (wrong password or unactivated auth account)
        if (
          signInErr.status === 400 ||
          signInErr.message === 'Invalid login credentials' ||
          signInErr.message?.toLowerCase().includes('invalid')
        ) {
          const err = new Error(
            'Invalid email/ID or password. If you are an existing lecturer or your account was recently registered, please verify your password or use "Forgot password?" below to reset/activate your account.'
          );
          err.code = 'INVALID_CREDENTIALS';
          err.email = resolvedEmail;
          throw err;
        }

        // 3. Rate limiting
        if (signInErr.status === 429 || signInErr.message?.toLowerCase().includes('too many')) {
          const err = new Error('Too many login attempts. For security reasons, please wait a few moments before trying again.');
          err.code = 'RATE_LIMITED';
          throw err;
        }

        // 4. Network or connectivity errors
        if (
          signInErr.message?.toLowerCase().includes('network') ||
          signInErr.message?.toLowerCase().includes('fetch') ||
          signInErr.name === 'AuthRetryableFetchError'
        ) {
          const err = new Error('Network connection error. Please verify your internet connection and try again.');
          err.code = 'NETWORK_ERROR';
          throw err;
        }

        const err = new Error(signInErr.message || 'Authentication failed. Please check your credentials.');
        err.code = 'AUTH_ERROR';
        throw err;
      }

      if (!data?.user) {
        throw new Error('Sign in succeeded but no active user session was returned. Please try again.');
      }

      user.value = data.user;
      const loadedProfile = await fetchProfile();

      if (!loadedProfile) {
        throw new Error(
          'Your account authenticated successfully, but your faculty profile could not be loaded. Please contact the administrator to verify your account configuration.'
        );
      }

      return loadedProfile;
    } catch (err) {
      error.value = err.message || 'Failed to login. Please check your credentials.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }


  /**
   * form: { fullName, email, role, idNumber, program, password }
   * Email domain is checked client-side for a fast error message, and
   * authoritatively re-checked by the on_auth_user_created DB trigger.
   */
async function register(form) {
  isLoading.value = true;
  error.value = '';

  try {
    const email = (form.email || '').trim().toLowerCase();
    const domain = email.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      throw new Error(`Registration is restricted to @${ALLOWED_DOMAIN} email addresses`);
    }

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role:      form.role === 'staff' ? 'Lecturer' : 'Student',
          id_number: form.idNumber,
          // programId now holds a faculty name string (faculties table)
          program:   form.programId || null,
          mode:      form.mode || null,
        },
      },
    });

    if (signUpErr) {
      throw new Error(signUpErr.message);
    }

    if (data.session) {
      user.value = data.user;
      await fetchProfile();
    }

    return data;
  } catch (err) {
    error.value = err.message || 'Registration failed. Please check your inputs.';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

  async function resendConfirmation(email) {
    const { error: resendErr } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (resendErr) throw new Error(resendErr.message);
  }

  async function logout() {
    await supabase.auth.signOut();
    user.value = null;
    profile.value = null;

    // Clear ALL lecturer/user-specific localStorage keys so that when the
    // next lecturer logs in they never see stale data from the previous session.
    const keysToRemove = [
      'userId',
      'userRole',
      'userEmail',
      'user',
      'token',
      'activeCourseId',
      'activeCourseCode',
      'activeCourseName',
      'activeCourseSemester',
      'activeCourseMode',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Also purge any Supabase session tokens left in localStorage
    const supabaseKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes('-auth-token') || k.startsWith('sb-'))) {
        supabaseKeys.push(k);
      }
    }
    supabaseKeys.forEach((k) => localStorage.removeItem(k));
  }

  /**
 * Batch-fetches public.users profiles by id — used whenever a component
 * needs student/lecturer display info (name, student_id, program_id) for
 * a set of ids resolved from another table (e.g. enrollments.student_id).
 * Returns [] on failure rather than throwing, since a lookup failure
 * shouldn't crash a list view — callers can render "Unknown" instead.
 */
async function fetchUsersByIds(ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error: fetchErr } = await supabase
    .from('users')
    .select('id, name, student_id, program_id, role, programmes!users_program_id_fkey(id, name, degree_abbreviation)')
    .in('id', uniqueIds)
    .order('name');

  if (fetchErr) {
    console.error('Failed to fetch users by id:', fetchErr);
    return [];
  }

  return data ?? [];
}

  return {
    user,
    profile,
    isLoading,
    error,
    initialize,
    fetchProfile,
    fetchUsersByIds,
    login,
    register,
    resendConfirmation,
    logout,
  };
});