
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface UseUserReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function getSession() {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        if (isMounted) setIsLoading(false);
        return;
      }
      
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    }

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          // If a new session event occurs, we are likely not in an initial loading state anymore
          // unless the newSession is also null (e.g. sign out)
          if (newSession !== null || _event === 'SIGNED_OUT') {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    // Auth listener will handle setting user and session to null
    // setIsLoading(false) will also be handled by auth listener
  };

  return { user, session, isLoading, signOut };
}
