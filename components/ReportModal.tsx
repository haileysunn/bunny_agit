"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function ReportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user, addPoints } = useAuth();
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
  const addressSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(loadKakaoMap, 100);
        return;
      }

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

          if (window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                setFormData(prev => ({
                  ...prev,
                  address: result[0].address.address_name
                }));
              }
            });
          }
        });

        if (currentLocation) {
          const center = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
          mapInstance.current.setCenter(center);
          markerInstance.current.setPosition(center);
        }
      });
    };

    loadKakaoMap();
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

    let reportLat = parseFloat(formData.latitude);
    let reportLng = parseFloat(formData.longitude);

    // 좌표가 없으면 주소로 찾기
    if (!formData.latitude || !formData.longitude) {
      if (!formData.address) {
        alert("❌ 주소를 입력하거나 지도에서 위치를 선택해주세요.");
        return;
      }

      setIsSubmitting(true);
      
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        const result: any = await new Promise((resolve, reject) => {
          geocoder.addressSearch(formData.address, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              resolve(result);
            } else {
              reject(status);
            }
          });
        });

        if (result && result[0]) {
          reportLat = parseFloat(result[0].y);
          reportLng = parseFloat(result[0].x);
          setFormData(prev => ({
            ...prev,
            latitude: reportLat.toString(),
            longitude: reportLng.toString(),
          }));
        } else {
          alert("❌ 주소를 찾을 수 없습니다. 지도에서 직접 선택해주세요.");
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        alert("❌ 주소를 찾을 수 없습니다. 지도에서 직접 선택해주세요.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!currentLocation) {
      alert("❌ 현재 위치를 가져오는 중입니다. 잠시만 기다려주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!isSubmitting) setIsSubmitting(true);

    const distance = getDistance(currentLocation.lat, currentLocation.lng, reportLat, reportLng);
    if (distance > 100) {
      alert(`❌ 제보 위치와 너무 멀리 떨어져 있습니다. (현재 ${Math.round(distance)}m)\n제보는 100m 이내에서만 가능합니다.`);
      return;
    }

    setIsSubmitting(true);

    const { data: nearbyAreas } = await supabase.rpc('find_nearby_areas', {
      lat: reportLat,
      lng: reportLng,
      radius: 5
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
        user_id: user?.id,
        reporter_location_lat: currentLocation.lat,
        reporter_location_lng: currentLocation.lng
      }]);
      
      // 포인트 적립
      if (user) {
        await addPoints(100);
      }
    }

    setIsSubmitting(false);
    
    if (verificationCount >= 3) {
      alert(`✅ 제보 완료! 검증 완료되어 지도에 표시됩니다.`);
    } else {
      alert(`✅ 제보 완료! (${verificationCount}/3명)\n3명 이상 제보 시 지도에 표시됩니다.`);
    }
    onSuccess();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setFormData({ ...formData, address: newAddress });

    if (addressSearchTimeout.current) {
      clearTimeout(addressSearchTimeout.current);
    }

    addressSearchTimeout.current = setTimeout(() => {
      if (newAddress && window.kakao?.maps?.services) {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(newAddress, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            
            setFormData(prev => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString(),
            }));

            if (mapInstance.current && markerInstance.current) {
              const position = new window.kakao.maps.LatLng(lat, lng);
              mapInstance.current.setCenter(position);
              markerInstance.current.setPosition(position);
            }
          }
        });
      }
    }, 1000);
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
              }
            });
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-md text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/images/logo_rabbit.png" alt="BunnyAgit" className="w-8 h-8 dark:hidden" />
          <img src="/assets/images/logo_rabbit_white.png" alt="BunnyAgit" className="w-8 h-8 hidden dark:block" />
          <h2 className="text-2xl font-bold">새 아지트 제보</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="장소명"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <div ref={mapRef} className="w-full h-48 md:h-64 rounded border border-gray-300 dark:border-gray-600" />
          <p className="text-xs text-gray-600 dark:text-gray-400">📍 지도를 클릭하여 위치를 선택하세요</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="주소"
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 text-base"
              value={formData.address}
              onChange={handleAddressChange}
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm shrink-0 whitespace-nowrap"
            >
              현재 위치
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_indoor: false })}
              className={`flex-1 py-3 rounded font-bold transition ${
                !formData.is_indoor 
                  ? 'bg-bunny-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              🌳 실외
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_indoor: true })}
              className={`flex-1 py-3 rounded font-bold transition ${
                formData.is_indoor 
                  ? 'bg-bunny-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              🏠 실내
            </button>
          </div>
          
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
