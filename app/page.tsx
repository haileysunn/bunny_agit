"use client";

import { useState, useEffect } from "react";
import KakaoMap from "@/components/KakaoMap";
import ReportModal from "@/components/ReportModal";
import ReviewModal from "@/components/ReviewModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import SearchBar from "@/components/SearchBar";
import { supabase, SmokingArea } from "@/lib/supabase";

export default function Home() {
  const [areas, setAreas] = useState<SmokingArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<SmokingArea[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SmokingArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toLocaleString('ko-KR', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }).replace(/[^0-9]/g, '');

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    setFilteredAreas(areas);
  }, [areas]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showReportModal) setShowReportModal(false);
        if (showReviewModal) setShowReviewModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showReportModal, showReviewModal]);

  const loadAreas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("smoking_areas")
      .select("*")
      .eq("is_verified", true);
    if (error) {
      setToast({ message: "데이터를 불러오는데 실패했습니다", type: "error" });
    } else if (data) {
      setAreas(data);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredAreas(areas);
      return;
    }
    const filtered = areas.filter(area => 
      area.name?.toLowerCase().includes(query.toLowerCase()) ||
      area.address?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAreas(filtered);
    setToast({ message: `${filtered.length}개의 아지트를 찾았습니다`, type: "info" });
  };

  const handleAreaClick = (area: SmokingArea) => {
    setSelectedArea(area);
    setShowReviewModal(true);
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      <header className="bg-bunny-primary text-white p-3 md:p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/images/logo_rabbit_white.png" alt="BunnyAgit" className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">BunnyAgit</h1>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">v.{buildTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title={darkMode ? "라이트 모드" : "다크 모드"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <p className="text-xs md:text-sm hidden sm:block">길 위에서 찾은 우리만의 아지트</p>
          </div>
        </div>
      </header>

      <SearchBar onSearch={handleSearch} />

      <main className="flex-1 relative">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <KakaoMap areas={filteredAreas} onAreaClick={handleAreaClick} />
        )}
        
        <button
          onClick={() => setShowReportModal(true)}
          className="absolute bottom-6 right-4 md:right-6 bg-bunny-primary text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg hover:bg-bunny-secondary transition z-50 text-sm md:text-base"
        >
          🥕 제보
        </button>
      </main>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            loadAreas();
            setShowReportModal(false);
            setToast({ message: "아지트 제보 완료! 100P 적립되었습니다 🎉", type: "success" });
          }}
        />
      )}

      {showReviewModal && selectedArea && (
        <ReviewModal
          area={selectedArea}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
