"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, User } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserProfile(session.user.id);
    });

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUserId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUserId)
      .single();

    if (data) {
      setUser(data);
    } else {
      // 프로필이 없으면 생성
      const authUser = (await supabase.auth.getUser()).data.user;
      const nickname = 
        authUser?.user_metadata?.full_name || 
        authUser?.user_metadata?.name ||
        authUser?.email?.split('@')[0] || 
        'user' + Math.random().toString(36).substr(2, 5);
      
      const { data: newUser } = await supabase
        .from("users")
        .insert([{ 
          id: authUserId,
          nickname: nickname
        }])
        .select()
        .single();
      if (newUser) setUser(newUser);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInWithKakao = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const addPoints = async (points: number) => {
    if (!user) return;
    
    const newPoints = user.points + points;
    const newRank =
      newPoints >= 1000 ? "대장 토끼" : newPoints >= 500 ? "굴지기" : "새끼 토끼";

    const { data } = await supabase
      .from("users")
      .update({ points: newPoints, rank: newRank })
      .eq("id", user.id)
      .select()
      .single();

    if (data) setUser(data);
  };

  const updateNickname = async (nickname: string) => {
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .update({ nickname })
      .eq("id", user.id)
      .select()
      .single();

    if (data) setUser(data);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      signUp, 
      signIn, 
      signInWithGoogle,
      signInWithKakao,
      signOut, 
      addPoints,
      updateNickname
    }}>
      {children}
    </AuthContext.Provider>
  );
}
