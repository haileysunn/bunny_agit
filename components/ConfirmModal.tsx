"use client";

import { useEffect } from "react";

type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
};

export default function ConfirmModal({ message, onConfirm, onCancel, type = "warning" }: ConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  const getIcon = () => {
    switch (type) {
      case "danger": return "🚨";
      case "warning": return "⚠️";
      default: return "❓";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-900 dark:text-white shadow-xl animate-slide-in">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{getIcon()}</span>
          <p className="flex-1 whitespace-pre-line leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded font-bold transition ${
              type === "danger" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-bunny-primary hover:bg-bunny-secondary"
            }`}
          >
            확인
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-3 rounded font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
