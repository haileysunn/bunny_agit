'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CSVSyncPage() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ name: '', address: '', lat: '', lng: '', indoor: '', source: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const h = text.split('\n')[0].split(',').map(s => s.trim());
      setHeaders(h);
    };
    reader.readAsText(f, 'UTF-8');
  };

  const handleSync = async () => {
    if (!file || !mapping.name || !mapping.lat || !mapping.lng) return;
    
    setLoading(true);
    setResult('처리 중...');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(s => s.trim());
      
      let inserted = 0, skipped = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((h, idx) => row[h] = values[idx]?.trim() || '');
        
        const lat = parseFloat(row[mapping.lat] || '0');
        const lng = parseFloat(row[mapping.lng] || '0');
        
        if (!lat || !lng) { skipped++; continue; }
        
        const { data: existing } = await supabase
          .from('smoking_areas')
          .select('id')
          .eq('latitude', lat)
          .eq('longitude', lng)
          .eq('is_public_data', true)
          .single();
        
        if (existing) { skipped++; continue; }
        
        const { error } = await supabase.from('smoking_areas').insert({
          name: row[mapping.name] || '흡연구역',
          address: row[mapping.address] || '',
          latitude: lat,
          longitude: lng,
          is_indoor: mapping.indoor ? row[mapping.indoor]?.includes('실내') : false,
          is_public_data: true,
          public_data_source: mapping.source || '서울시',
          public_data_updated_at: new Date().toISOString(),
          verification_count: 10,
          is_verified: true,
        });
        
        error ? skipped++ : inserted++;
      }
      
      setResult(`✅ ${inserted}개 추가, ⏭️ ${skipped}개 스킵`);
      setLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
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
                <label className="block mb-1">시설명 컬럼 *</label>
                <select onChange={(e) => setMapping({...mapping, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">주소 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, address: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">위도 컬럼 *</label>
                <select onChange={(e) => setMapping({...mapping, lat: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">경도 컬럼 *</label>
                <select onChange={(e) => setMapping({...mapping, lng: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block mb-1">실내외 구분 컬럼</label>
                <select onChange={(e) => setMapping({...mapping, indoor: e.target.value})} className="w-full bg-gray-700 p-2 rounded">
                  <option value="">선택</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
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
            </div>
          )}
          
          <button
            onClick={handleSync}
            disabled={!file || !mapping.name || !mapping.lat || !mapping.lng || loading}
            className="bg-purple-600 px-6 py-2 rounded disabled:opacity-50 w-full"
          >
            {loading ? '처리 중...' : '동기화 시작'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
