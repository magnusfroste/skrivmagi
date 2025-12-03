import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'student' | 'teacher' | 'parent';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        return data.role as UserRole;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout-skydd: om loading inte blir false inom 5 sekunder, tvinga det
    const timeoutId = setTimeout(() => {
      if (loadingRef.current && isMounted) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          if (isMounted) {
            setRole(userRole);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Fetch role with setTimeout to avoid Supabase deadlock
            setTimeout(async () => {
              if (!isMounted) return;
              try {
                const userRole = await fetchUserRole(session.user.id);
                if (isMounted) {
                  setRole(userRole);
                }
              } catch (error) {
                console.error('Failed to fetch role in auth change:', error);
              }
            }, 0);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role
        }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
