"use client";

import { useEffect } from "react";

export default function Toast({ 
  message, 
  type = "success",
  onClose 
}: { 
  message: string; 
  type?: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
        <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
