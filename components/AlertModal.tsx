"use client";

import { useEffect } from "react";

type AlertModalProps = {
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "warning" | "info";
};

export default function AlertModal({ message, onClose, type = "info" }: AlertModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success": return "text-green-600 dark:text-green-400";
      case "error": return "text-red-600 dark:text-red-400";
      case "warning": return "text-orange-600 dark:text-orange-400";
      default: return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-gray-900 dark:text-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <span className={`text-3xl ${getColor()}`}>{getIcon()}</span>
          <p className="flex-1 whitespace-pre-line leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-bunny-primary text-white py-3 rounded font-bold hover:bg-bunny-secondary transition"
        >
          확인
        </button>
      </div>
    </div>
  );
}
