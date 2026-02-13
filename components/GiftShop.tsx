"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

const gifts = [
  { name: "스타벅스 아메리카노", points: 500 },
  { name: "편의점 3000원권", points: 300 },
  { name: "맥도날드 빅맥세트", points: 700 },
  { name: "CGV 영화 관람권", points: 1000 },
];

export default function GiftShop({ onClose }: { onClose: () => void }) {
  const { user, addPoints } = useAuth();

  const handleExchange = async (gift: typeof gifts[0]) => {
    if (!user || user.points < gift.points) {
      return alert("포인트가 부족합니다!");
    }

    const { error } = await supabase.from("gift_exchanges").insert([
      { user_id: user.id, gift_name: gift.name, points_used: gift.points },
    ]);

    if (!error) {
      await addPoints(-gift.points);
      alert(`${gift.name} 교환 완료!`);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">🎁 기프티콘 교환</h2>
        <p className="text-sm mb-4">보유 포인트: {user?.points}P</p>
        <div className="space-y-3">
          {gifts.map((gift) => (
            <div key={gift.name} className="flex justify-between items-center border p-3 rounded">
              <div>
                <div className="font-bold">{gift.name}</div>
                <div className="text-sm text-gray-600">{gift.points}P</div>
              </div>
              <button
                onClick={() => handleExchange(gift)}
                className="bg-bunny-primary text-white px-4 py-2 rounded"
              >
                교환
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-4 bg-gray-300 py-2 rounded">
          닫기
        </button>
      </div>
    </div>
  );
}
