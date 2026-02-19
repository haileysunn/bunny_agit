"use client";

import { useState, useEffect } from "react";
import KakaoMap from "@/components/KakaoMap";
import ReportModal from "@/components/ReportModal";
import ReviewModal from "@/components/ReviewModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import SearchBar from "@/components/SearchBar";
import LoginModal from "@/components/LoginModal";
import ProfileModal from "@/components/ProfileModal";
import { supabase, SmokingArea } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, signOut } = useAuth();
  const [areas, setAreas] = useState<SmokingArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<SmokingArea[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SmokingArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toLocaleString('ko-KR', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }).replace(/[^0-9]/g, '');
  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'dev';

  useEffect(() => {
    loadAreas();
    if (user) loadFavorites();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [areas, showFavoritesOnly, favoriteIds]);

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

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("area_id")
      .eq("user_id", user.id);
    if (data) {
      setFavoriteIds(data.map(f => f.area_id));
    }
  };

  const applyFilters = () => {
    let filtered = areas;
    if (showFavoritesOnly && favoriteIds.length > 0) {
      filtered = areas.filter(area => favoriteIds.includes(area.id));
    }
    setFilteredAreas(filtered);
  };

  const toggleFavoriteFilter = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly && favoriteIds.length === 0) {
      setToast({ message: "즐겨찾기한 아지트가 없습니다", type: "info" });
    }
  };

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
    
    if (filtered.length > 0) {
      setToast({ message: `${filtered.length}개의 아지트를 찾았습니다`, type: "info" });
    } else {
      setToast({ message: "검색 결과가 없습니다", type: "info" });
    }
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
              {isDev && <span className="text-xs bg-white/20 px-2 py-1 rounded">v.{buildTime}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavoriteFilter}
              className={`p-2 hover:bg-white/10 rounded-lg transition ${
                showFavoritesOnly ? 'bg-white/20' : ''
              }`}
              title="즐겨찾기"
            >
              {showFavoritesOnly ? "⭐" : "☆"}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title={darkMode ? "라이트 모드" : "다크 모드"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="text-right hidden sm:block hover:bg-white/10 px-2 py-1 rounded transition"
                >
                  <div className="text-sm font-bold">{user.nickname}</div>
                  <div className="text-xs">{user.rank} | {user.points}P</div>
                </button>
                <button
                  onClick={signOut}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition text-sm font-medium"
              >
                로그인
              </button>
            )}
            <p className="text-xs md:text-sm hidden md:block">길 위에서 찾은 우리만의 아지트</p>
          </div>
        </div>
      </header>

      <SearchBar onSearch={handleSearch} areas={areas} />

      <main className="flex-1 relative">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <KakaoMap areas={filteredAreas} onAreaClick={handleAreaClick} />
        )}
        
        <button
          onClick={() => setShowReportModal(true)}
          className="absolute bottom-6 right-4 md:right-6 bg-bunny-primary text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg hover:bg-bunny-secondary transition z-50 text-sm md:text-base font-bold"
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

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
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
