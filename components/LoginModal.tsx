"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        alert("✅ 비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.");
        setMode('signin');
      } else if (mode === 'signup') {
        // 회원가입 시도
        try {
          await signUp(email, password);
          alert("✅ 회원가입 완료!");
          onClose();
        } catch (signupError: any) {
          // 이미 존재하는 이메일인 경우 로그인 시도해보기
          if (signupError.message?.includes("already registered")) {
            alert("❌ 이미 가입된 이메일입니다.\n\n구글로 가입하셨다면 🔵 Google로 로그인 버튼을 사용해주세요.");
          } else {
            throw signupError;
          }
        }
      } else {
        // 로그인 시도
        await signIn(email, password);
        alert("✅ 로그인 성공! 🐰");
        onClose();
      }
    } catch (error: any) {
      const errorMsg = error.message || "";
      
      if (errorMsg.includes("Invalid login credentials")) {
        alert("❌ 이메일 또는 비밀번호가 올바르지 않습니다.\n\n구글로 가입하셨다면 🔵 Google로 로그인 버튼을 사용해주세요.");
      } else {
        alert("❌ " + (errorMsg || "로그인 실패"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      alert("❌ 구글 로그인 실패: " + error.message);
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
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">BunnyAgit</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded transition ${
              mode === 'signin' 
                ? 'bg-bunny-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded transition ${
              mode === 'signup' 
                ? 'bg-bunny-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            회원가입
          </button>
        </div>

        {mode === 'reset' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="이메일"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary disabled:bg-gray-400"
              >
                {isSubmitting ? "발송 중..." : "재설정 이메일 발송"}
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-bunny-primary"
              >
                ← 로그인으로 돌아가기
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="이메일"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-bunny-primary"
              >
                비밀번호를 잊으셨나요?
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary disabled:bg-gray-400"
            >
              {isSubmitting ? "처리 중..." : mode === 'signup' ? "회원가입" : "로그인"}
            </button>
          </form>
        )}

        {mode !== 'reset' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">또는</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded font-medium hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
