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

  async function fetchProfile() {
    if (!user.value) return null;
    const { data, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single();

    if (fetchErr) {
      console.error('Failed to load profile:', fetchErr);
      return null;
    }
    profile.value = data;
    return data;
  }

  /**
   * loginId can be either the full @southshore.edu.gh email or the
   * user's Student/Staff ID number. selectedRole is whatever the login
   * form's role dropdown was set to, and is verified against the actual
   * stored role after sign-in — a mismatch is treated as invalid
   * credentials rather than silently trusting the dropdown.
   */
  async function login({ loginId, password, selectedRole }) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc(
        'get_login_email',
        { p_login_id: loginId }
      );

      if (rpcErr || !resolvedEmail) {
        throw new Error('Invalid credentials');
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (signInErr) {
        if (signInErr.message === 'Email not confirmed') {
          const err = new Error(
            'Please confirm your email address before signing in — check your inbox for the confirmation link.'
          );
          err.code = 'EMAIL_NOT_CONFIRMED';
          err.email = resolvedEmail;
          throw err;
        }
        throw new Error(
          signInErr.message === 'Invalid login credentials'
            ? 'Invalid credentials'
            : signInErr.message
        );
      }

      user.value = data.user;
      const loadedProfile = await fetchProfile();

      if (selectedRole && loadedProfile?.role !== selectedRole) {
        await supabase.auth.signOut();
        user.value = null;
        profile.value = null;
        throw new Error(`No ${selectedRole} account was found for those credentials`);
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
          role: form.role === 'staff' ? 'Lecturer' : 'Student',
          id_number: form.idNumber,
          program_id: form.programId,   // ✅ FK now sent instead of a name string
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
  }

  return {
    user,
    profile,
    isLoading,
    error,
    initialize,
    fetchProfile,
    login,
    register,
    resendConfirmation,
    logout,
  };
});