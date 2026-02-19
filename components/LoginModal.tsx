"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await login(nickname);
      alert(`✅ 환영합니다, ${nickname}님! 🐰`);
      onClose();
    } catch (error) {
      alert("❌ 로그인 실패. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-sm text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">BunnyAgit 시작하기</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="닉네임 입력"
            className="w-full p-3 border border-gray-300 rounded mb-4 text-gray-900 text-base"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary disabled:bg-gray-400"
          >
            {isSubmitting ? "로그인 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
