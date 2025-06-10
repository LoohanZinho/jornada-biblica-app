
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import type { AppUser, UserAppMetadata } from '@/types'; // Importando AppUser e UserAppMetadata

interface UseUserReturn {
  user: AppUser | null; // Alterado para AppUser
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  // Adicionando uma função para simular a atualização do plano (para testes futuros)
  // updateUserPlan: (plan: UserAppMetadata['plan']) => void; 
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function getSessionAndUser() {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        if (isMounted) setIsLoading(false);
        return;
      }
      
      if (isMounted) {
        setSession(currentSession);
        if (currentSession?.user) {
          // Simulando o plano do usuário. Em um app real, isso viria do DB.
          const appUser: AppUser = {
            ...currentSession.user,
            app_metadata: {
              ...currentSession.user.user_metadata,
              plan: 'free', // Hardcoded para 'free' para todos os usuários logados por enquanto
            } as UserAppMetadata,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    }

    getSessionAndUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          if (newSession?.user) {
            const appUser: AppUser = {
              ...newSession.user,
              app_metadata: {
                ...newSession.user.user_metadata,
                plan: user?.app_metadata.plan || 'free', // Mantém o plano se já existir, ou default para 'free'
              } as UserAppMetadata,
            };
            setUser(appUser);
          } else {
            setUser(null);
          }
          if (newSession !== null || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
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
  }, [user?.app_metadata.plan]); // Adicionada dependência para refletir mudanças de plano simuladas

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    // Auth listener handles setting user/session to null and isLoading to false
  };

  // Função de simulação para "atualizar" o plano do usuário no estado do hook
  // (NÃO atualiza no Supabase, apenas para testes de UI com diferentes planos)
  // const updateUserPlan = (newPlan: UserAppMetadata['plan']) => {
  //   if (user) {
  //     setUser(prevUser => {
  //       if (!prevUser) return null;
  //       return {
  //         ...prevUser,
  //         app_metadata: {
  //           ...prevUser.app_metadata,
  //           plan: newPlan,
  //         }
  //       };
  //     });
  //   }
  // };

  return { user, session, isLoading, signOut /*, updateUserPlan */ };
}
