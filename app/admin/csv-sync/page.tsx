'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CSVSyncPage() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any>({});
  const [mapping, setMapping] = useState({ name: '', address: '', lat: '', lng: '', indoor: '', source: '', dataDate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const h = lines[0].split(',').map(s => s.trim());
      setHeaders(h);
      
      if (lines[1]) {
        const values = lines[1].split(',');
        const sample: any = {};
        h.forEach((header, idx) => sample[header] = values[idx]?.trim() || '');
        setSampleData(sample);
      }
    };
    reader.readAsText(f, 'EUC-KR');
  };

  const getCoordsByAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      const checkKakao = () => {
        if ((window as any).kakao?.maps?.services) {
          const geocoder = new (window as any).kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result: any, status: any) => {
            if (status === (window as any).kakao.maps.services.Status.OK) {
              resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
            } else {
              resolve(null);
            }
          });
        } else if ((window as any).kakao?.maps?.load) {
          (window as any).kakao.maps.load(() => checkKakao());
        } else {
          resolve(null);
        }
      };
      checkKakao();
    });
  };

  const handleSync = async () => {
    if (!file || !mapping.address) return;
    
    setLoading(true);
    setResult('처리 중...');
    setProgress({ current: 0, total: 0 });
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(s => s.trim());
      
      const total = lines.length - 1;
      setProgress({ current: 0, total });
      
      let inserted = 0, skipped = 0, failed = 0;
      
      for (let i = 1; i < lines.length; i++) {
        setProgress({ current: i, total });
        setResult(`처리 중... ${i}/${total}`);
        
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((h, idx) => row[h] = values[idx]?.trim() || '');
        
        let lat = mapping.lat ? parseFloat(row[mapping.lat] || '0') : 0;
        let lng = mapping.lng ? parseFloat(row[mapping.lng] || '0') : 0;
        const address = row[mapping.address] || '';
        
        if ((!lat || !lng) && address) {
          const coords = await getCoordsByAddress(address);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          } else {
            failed++;
            continue;
          }
        }
        
        if (!lat || !lng) { skipped++; continue; }
        
        const name = row[mapping.name] || address.split(' ').slice(0, 3).join(' ') || '흡연구역';
        
        const { data: existing } = await supabase
          .from('smoking_areas')
          .select('id')
          .eq('latitude', lat)
          .eq('longitude', lng)
          .eq('is_public_data', true)
          .single();
        
        if (existing) { skipped++; continue; }
        
        const { error } = await supabase.from('smoking_areas').insert({
          name,
          address,
          latitude: lat,
          longitude: lng,
          is_indoor: mapping.indoor ? (row[mapping.indoor]?.includes('실내') || row[mapping.indoor]?.includes('폐쇄')) : false,
          is_public_data: true,
          public_data_source: mapping.source || '서울시',
          public_data_updated_at: mapping.dataDate || new Date().toISOString(),
          verification_count: 0,
          is_verified: true,
        });
        
        error ? skipped++ : inserted++;
      }
      
      setResult(`✅ ${inserted}개 추가, ⏭️ ${skipped}개 스킵, ❌ ${failed}개 실패`);
      setLoading(false);
    };
    reader.readAsText(file, 'EUC-KR');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🐰 CSV 동기화</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-4 text-white"
          />
          
          {headers.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block mb-1">시설명 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택 (비어있으면 주소에서 추출)</option>
                  {headers.map(h => <option key={h} value={h}>{h} ({sampleData[h] || ''})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">주소 컬럼 *</label>
                <select onChange={(e) => setMapping({...mapping, address: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h} ({sampleData[h] || ''})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">위도 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, lat: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택 (비어있으면 주소로 변환)</option>
                  {headers.map(h => <option key={h} value={h}>{h} ({sampleData[h] || ''})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">경도 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, lng: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택 (비어있으면 주소로 변환)</option>
                  {headers.map(h => <option key={h} value={h}>{h} ({sampleData[h] || ''})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">실내외 구분 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, indoor: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택 (비어있으면 실외로 처리)</option>
                  {headers.map(h => <option key={h} value={h}>{h} ({sampleData[h] || ''})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">데이터 출처 *</label>
                <input
                  type="text"
                  placeholder="예: 광진구청"
                  onChange={(e) => setMapping({...mapping, source: e.target.value})}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">데이터 등록일</label>
                <input
                  type="date"
                  onChange={(e) => setMapping({...mapping, dataDate: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className="w-full bg-gray-700 p-2 rounded text-white"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleSync}
            disabled={!file || !mapping.address || loading}
            className="bg-purple-600 px-6 py-2 rounded disabled:opacity-50 w-full"
          >
            {loading ? '처리 중...' : '동기화 시작'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              {loading && progress.total > 0 && (
                <div className="mb-2">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
