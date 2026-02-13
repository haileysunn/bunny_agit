"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, User } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  login: (nickname: string) => Promise<void>;
  logout: () => void;
  addPoints: (points: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) loadUser(savedUserId);
  }, []);

  const loadUser = async (id: string) => {
    const { data } = await supabase.from("users").select("*").eq("id", id).single();
    if (data) setUser(data);
  };

  const login = async (nickname: string) => {
    const { data } = await supabase
      .from("users")
      .insert([{ nickname }])
      .select()
      .single();
    if (data) {
      setUser(data);
      localStorage.setItem("userId", data.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
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

  return (
    <AuthContext.Provider value={{ user, login, logout, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
}
