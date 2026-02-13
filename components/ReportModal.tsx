"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    is_indoor: false,
  });
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      };

      mapInstance.current = new window.kakao.maps.Map(container, options);
      markerInstance.current = new window.kakao.maps.Marker({
        position: mapInstance.current.getCenter(),
        map: mapInstance.current,
      });

      window.kakao.maps.event.addListener(mapInstance.current, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        markerInstance.current.setPosition(latlng);
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            setFormData(prev => ({
              ...prev,
              address: result[0].address.address_name
            }));
          }
        });
      });

      if (currentLocation) {
        const center = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
        mapInstance.current.setCenter(center);
        markerInstance.current.setPosition(center);
      }
    });
  }, [currentLocation]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const reportLat = parseFloat(formData.latitude);
    const reportLng = parseFloat(formData.longitude);

    if (!currentLocation) {
      alert("❌ 현재 위치를 가져오는 중입니다. 잠시만 기다려주세요.");
      return;
    }

    const distance = getDistance(currentLocation.lat, currentLocation.lng, reportLat, reportLng);
    if (distance > 100) {
      alert(`❌ 제보 위치와 너무 멀리 떨어져 있습니다. (현재 ${Math.round(distance)}m)\n제보는 100m 이내에서만 가능합니다.`);
      return;
    }

    setIsSubmitting(true);

    const { data: nearbyAreas } = await supabase.rpc('find_nearby_areas', {
      lat: reportLat,
      lng: reportLng,
      radius: 50
    });

    let areaId;
    let verificationCount = 1;

    if (nearbyAreas && nearbyAreas.length > 0) {
      areaId = nearbyAreas[0].id;
      verificationCount = nearbyAreas[0].verification_count + 1;
      
      await supabase
        .from('smoking_areas')
        .update({ 
          verification_count: verificationCount,
          is_verified: verificationCount >= 3
        })
        .eq('id', areaId);
    } else {
      const { data: newArea } = await supabase
        .from("smoking_areas")
        .insert([{
          name: formData.name,
          address: formData.address,
          latitude: reportLat,
          longitude: reportLng,
          is_indoor: formData.is_indoor,
          verification_count: 1,
          is_verified: false
        }])
        .select()
        .single();
      
      areaId = newArea?.id;
    }

    if (areaId) {
      await supabase.from('area_reports').insert([{
        area_id: areaId,
        reporter_location_lat: currentLocation.lat,
        reporter_location_lng: currentLocation.lng
      }]);
    }

    setIsSubmitting(false);
    
    if (verificationCount >= 3) {
      alert(`✅ 제보 완료! 검증 완료되어 지도에 표시됩니다.`);
    } else {
      alert(`✅ 제보 완료! (${verificationCount}/3명)\n3명 이상 제보 시 지도에 표시됩니다.`);
    }
    onSuccess();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCurrentLocation({ lat, lng });
          setFormData({
            ...formData,
            latitude: lat.toString(),
            longitude: lng.toString(),
          });
          
          // Kakao Geocoder로 주소 가져오기
          if (window.kakao && window.kakao.maps) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                const address = result[0].address.address_name;
                setFormData(prev => ({
                  ...prev,
                  address: address
                }));
                alert(`📍 현재 위치를 가져왔습니다!\n${address}`);
              } else {
                alert("📍 현재 위치를 가져왔습니다!");
              }
            });
          } else {
            alert("📍 현재 위치를 가져왔습니다!");
          }
        },
        (error) => {
          alert("❌ 위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.");
        }
      );
    } else {
      alert("❌ 이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-md text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">새 아지트 제보</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={mapRef} className="w-full h-48 md:h-64 rounded border border-gray-300 dark:border-gray-600" />
          <p className="text-xs text-gray-600 dark:text-gray-400">📍 지도를 클릭하여 위치를 선택하세요</p>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
          >
            📍 현재 위치로 이동
          </button>
          <input
            type="text"
            placeholder="장소명"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="주소"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_indoor}
              onChange={(e) => setFormData({ ...formData, is_indoor: e.target.checked })}
            />
            🏠 실내
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-bunny-primary text-white py-3 rounded hover:bg-bunny-secondary font-bold disabled:bg-gray-400"
            >
              {isSubmitting ? "제보 중..." : "제보하기"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-3 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-bold"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
