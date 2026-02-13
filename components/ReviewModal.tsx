"use client";

import { useState, useEffect } from "react";
import { supabase, SmokingArea, Review } from "@/lib/supabase";

export default function ReviewModal({
  area,
  onClose,
}: {
  area: SmokingArea;
  onClose: () => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cleanliness, setCleanliness] = useState(5);
  const [isAvailable, setIsAvailable] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("area_id", area.id)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const calculateTrust = () => {
    if (reviews.length === 0) {
      // 공공데이터이고 리뷰가 없으면 데이터 제공 시점 기준 신뢰도
      if (area.is_public_data && area.public_data_updated_at) {
        const now = new Date();
        const dataDate = new Date(area.public_data_updated_at);
        const daysDiff = Math.floor((now.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // 기본 20% + 최근성 보너스 (30일 기준, 최대 +50%)
        const recencyBonus = Math.max(0, Math.min(50, 50 - daysDiff * 1.5));
        const trustScore = Math.round(20 + recencyBonus);
        
        return { 
          trustScore, 
          availableRate: 1, 
          showWarning: false, 
          latestReview: null,
          isPublicData: true 
        };
      }
      return null;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentReviews = reviews.filter(r => new Date(r.created_at) > sevenDaysAgo);
    if (recentReviews.length === 0) return null;

    const availableCount = recentReviews.filter(r => r.is_available).length;
    const availableRate = availableCount / recentReviews.length;
    const avgCleanliness = recentReviews.reduce((sum, r) => sum + r.cleanliness, 0) / recentReviews.length;

    const trustScore = Math.round((availableRate * 0.6 + avgCleanliness / 5 * 0.4) * 100);

    const latestReview = reviews[0];
    const isLatestRecent = new Date(latestReview.created_at) > oneDayAgo;
    const showWarning = isLatestRecent && !latestReview.is_available && availableRate > 0.5;

    return { trustScore, availableRate, showWarning, latestReview, isPublicData: false };
  };

  const trustData = calculateTrust();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    const { error } = await supabase.from("reviews").insert([
      {
        area_id: area.id,
        cleanliness,
        is_available: isAvailable,
        comment,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("❌ 리뷰 등록 실패: " + error.message);
      console.error(error);
    } else {
      alert("✅ 리뷰 작성 완료!");
      loadReviews();
      setComment("");
      setCleanliness(5);
      setIsAvailable(true);
    }
  };

  const avgCleanliness =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length).toFixed(1)
      : "❓";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">{area.name}</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{area.address}</p>
        
        <div className="flex gap-4 mb-4 text-sm flex-wrap">
          <span>{area.is_indoor ? "🏠 실내" : "🌳 실외"}</span>
          <span>⭐ 청결도: {avgCleanliness}</span>
          <span className="whitespace-nowrap">
            {area.is_public_data 
              ? "👥 검증: 🏢공공" 
              : area.verification_count > 0 
                ? `👥 검증: ${area.verification_count}명`
                : "👥 검증: 0명"
            }
          </span>
        </div>

        {trustData && (
          <div className={`mb-4 p-3 rounded ${
            trustData.trustScore >= 80 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
            trustData.trustScore >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
            'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {trustData.trustScore >= 80 ? '🟢' : trustData.trustScore >= 50 ? '🟡' : '🔴'}
              </span>
              <span className="font-bold">신뢰도 {trustData.trustScore}%</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {trustData.isPublicData 
                  ? `(데이터 연동: ${new Date(area.public_data_updated_at!).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })})` 
                  : '(최근 7일 기준)'
                }
              </span>
            </div>
            {!trustData.isPublicData && (
              <div className="text-xs text-gray-700 dark:text-gray-300">
                이용가능 {Math.round(trustData.availableRate * 100)}% | 청결도 {avgCleanliness}
              </div>
            )}
            {trustData.showWarning && trustData.latestReview && (
              <div className="mt-2 text-sm text-orange-700 dark:text-orange-400 font-bold">
                ⚠️ 최근 이용불가 리뷰 있음 ({new Date(trustData.latestReview.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-bold mb-2">리뷰 작성</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">청결도 (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={cleanliness}
              onChange={(e) => setCleanliness(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{cleanliness}점</span>
          </div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            이용 가능
          </label>
          <textarea
            placeholder="코멘트 (선택)"
            className="w-full p-2 border dark:border-gray-600 rounded mb-2 dark:bg-gray-600 dark:text-white text-base"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bunny-primary text-white py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "등록 중..." : "리뷰 등록"}
          </button>
        </form>

        <div>
          <h3 className="font-bold mb-2">최근 리뷰 ({reviews.length})</h3>
          {reviews.map((review) => (
            <div key={review.id} className="border-b dark:border-gray-700 py-2">
              <div className="flex justify-between text-sm">
                <span>⭐ {review.cleanliness}점</span>
                <span className={review.is_available ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {review.is_available ? "✅ 이용가능" : "❌ 이용불가"}
                </span>
              </div>
              {review.comment && <p className="text-sm mt-1">{review.comment}</p>}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-300 dark:bg-gray-600 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
