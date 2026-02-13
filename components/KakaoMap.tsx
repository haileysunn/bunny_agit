"use client";

import { useEffect, useRef } from "react";
import { SmokingArea } from "@/lib/supabase";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({
  areas,
  onAreaClick,
}: {
  areas: SmokingArea[];
  onAreaClick: (area: SmokingArea) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const moveToCurrentLocation = () => {
    if (!mapInstance.current) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locPosition = new window.kakao.maps.LatLng(lat, lng);
          mapInstance.current.setCenter(locPosition);
        },
        (error) => {
          alert("❌ 위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.");
        }
      );
    } else {
      alert("❌ 이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initMap, 100);
        return;
      }

      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        mapInstance.current = new window.kakao.maps.Map(container, options);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);
            mapInstance.current.setCenter(locPosition);
          });
        }
      });
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.kakao) return;

    areas.forEach((area) => {
      const position = new window.kakao.maps.LatLng(
        area.latitude,
        area.longitude
      );

      const marker = new window.kakao.maps.Marker({
        position,
        map: mapInstance.current,
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:12px;">
          <strong>🐰 ${area.name}</strong><br/>
          ${area.is_indoor ? "🏠 실내" : "🌳 실외"}
        </div>`,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        onAreaClick(area);
      });

      window.kakao.maps.event.addListener(marker, "mouseover", () => {
        infowindow.open(mapInstance.current, marker);
      });

      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        infowindow.close();
      });
    });
  }, [areas, onAreaClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <button
        onClick={moveToCurrentLocation}
        className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white text-bunny-primary p-2 md:p-3 rounded-full shadow-lg hover:bg-gray-100 transition z-50 text-xl md:text-2xl"
        title="내 위치로 이동"
      >
        📍
      </button>
    </div>
  );
}
