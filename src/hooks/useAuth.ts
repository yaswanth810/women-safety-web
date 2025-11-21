import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: 'user' | 'moderator' | 'admin';
  profile_picture: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (data) {
            setUser(data as User);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          if (session?.user) {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (data) {
              setUser(data as User);
            }
          } else {
            setUser(null);
          }
        })();
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authUser) throw new Error('Signup failed');

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email,
          full_name: fullName,
          role: 'user',
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      if (data) {
        setUser(data as User);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authUser) throw new Error('Login failed');

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (data) {
        setUser(data as User);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUser(data as User);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
};
