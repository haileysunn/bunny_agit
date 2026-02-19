"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, session, refreshUser, deleteAccount } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = session?.user?.app_metadata?.provider || "email";
  const email = session?.user?.email || "";
  const providerLabel = provider === "google" ? "🔵 구글" : "📧 이메일";

  const handleDelete = async () => {
    const confirmMsg = `⚠️ 정말로 탈퇴하시겠습니까?\n\n삭제되는 데이터:\n• 닉네임: ${user?.nickname}\n• 랭크: ${user?.rank}\n• 포인트: ${user?.points}P\n• 즐겨찾기 목록\n\n유지되는 데이터:\n• 작성한 리뷰 (익명 처리)\n• 제보한 아지트 (익명 처리)\n\n⚠️ 탈퇴 후 복구가 불가능합니다.`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    const finalConfirm = confirm("정말로 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.");
    if (!finalConfirm) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteAccount();
      alert("✅ 회원 탈퇴가 완료되었습니다.\n\n작성하신 리뷰와 제보는 커뮤니티를 위해 익명으로 유지됩니다.\n그동안 bunnyAgit을 이용해주셔서 감사합니다. 🐰");
      onClose();
    } catch (error: any) {
      alert("❌ 탈퇴 실패: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setIsEditMode(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-900 dark:text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8 dark:hidden" />
          <img src="/assets/images/logo_rabbit_white.png" alt="BunnyAgit" className="w-8 h-8 hidden dark:block" />
          <h2 className="text-2xl font-bold">프로필 정보</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">닉네임</span>
              {isEditMode ? (
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  minLength={2}
                />
              ) : (
                <span className="font-bold">{user?.nickname}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">로그인</span>
              <span>{email} ({providerLabel})</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">랭크</span>
              <span className="font-bold text-bunny-secondary">{user?.rank}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">포인트</span>
              <span className="font-bold text-bunny-secondary">{user?.points}P</span>
            </div>
          </div>

          {isEditMode ? (
            <>
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
                  onClick={() => {
                    setIsEditMode(false);
                    setNickname(user?.nickname || "");
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-3 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-bold"
                >
                  취소
                </button>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="text-xs text-gray-900 dark:text-gray-300 underline italic hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                >
                  회원 탈퇴
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="flex-1 bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary"
              >
                수정
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-3 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-bold"
              >
                닫기
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
