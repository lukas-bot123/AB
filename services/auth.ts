import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput & {
  fullName: string;
};

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export function listenToAuthChanges(onSessionChange: (session: Session | null) => void) {
  if (!isSupabaseConfigured) {
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signIn({ email, password }: SignInInput) {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signUp({ email, fullName, password }: SignUpInput) {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
