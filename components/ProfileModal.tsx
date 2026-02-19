"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, session, refreshUser } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = session?.user?.app_metadata?.provider || "email";
  const email = session?.user?.email || "";
  const providerLabel = provider === "google" ? "🔵 구글" : "📧 이메일";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !user) return;

    if (nickname.trim().length < 2) {
      alert("❌ 닉네임은 2글자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    // 중복 체크
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", nickname.trim())
      .neq("id", user.id)
      .single();

    if (existing) {
      alert("❌ 이미 사용 중인 닉네임입니다.");
      setIsSubmitting(false);
      return;
    }

    // 닉네임 업데이트
    const { error } = await supabase
      .from("users")
      .update({ nickname: nickname.trim() })
      .eq("id", user.id);

    setIsSubmitting(false);

    if (error) {
      alert("❌ 닉네임 변경 실패: " + error.message);
    } else {
      alert("✅ 닉네임이 변경되었습니다!");
      await refreshUser();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">프로필 수정</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">닉네임</label>
            <input
              type="text"
              placeholder="닉네임 (2글자 이상)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>로그인: {providerLabel}</p>
            <p>이메일: {email}</p>
            <p>랭크: {user?.rank}</p>
            <p>포인트: {user?.points}P</p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary disabled:bg-gray-400"
            >
              {isSubmitting ? "변경 중..." : "변경"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-3 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-bold"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
