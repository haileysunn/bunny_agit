// pData 폴더의 CSV 파일들을 Supabase에 업로드
// 사용법: node scripts/syncCSV.js

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });
}

function extractSource(fileName) {
  if (fileName.includes('광진구')) return '광진구청';
  if (fileName.includes('관악구')) return '관악구청';
  if (fileName.includes('노원구')) return '노원구청';
  if (fileName.includes('중구')) return '중구청';
  if (fileName.includes('서대문구')) return '서대문구청';
  if (fileName.includes('양천구')) return '양천구청';
  return '서울시';
}

function getColumnMapping(fileName) {
  if (fileName.includes('관악구')) {
    return { name: '시설명', address: '소재지', lat: null, lng: null, indoor: null };
  }
  if (fileName.includes('노원구')) {
    return { name: '시설명', address: '소재지', lat: '위도', lng: '경도', indoor: null };
  }
  if (fileName.includes('중구')) {
    return { name: '시설명', address: '소재지도로명주소', lat: null, lng: null, indoor: null };
  }
  if (fileName.includes('광진구') && fileName.includes('데이터')) {
    return { name: '시설명', address: '도로명주소', lat: '위도', lng: '경도', indoor: null };
  }
  if (fileName.includes('광진구')) {
    return { name: '시설명', address: '소재지(㎡)', lat: null, lng: null, indoor: '실내외 구분' };
  }
  if (fileName.includes('서대문구')) {
    return { name: '시설명', address: '소재지도로명', lat: null, lng: null, indoor: null };
  }
  if (fileName.includes('양천구')) {
    return { name: '시설명', address: '소재지 도로명', lat: null, lng: null, indoor: null };
  }
  return { name: '시설명', address: '소재지', lat: '위도', lng: '경도', indoor: '실내외구분' };
}

async function syncCSV() {
  const pDataDir = path.join(__dirname, '../pData');
  const files = fs.readdirSync(pDataDir).filter(f => f.endsWith('.csv'));
  
  console.log(`📁 ${files.length}개 CSV 파일 발견`);
  
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const file of files) {
    console.log(`\n📄 처리 중: ${file}`);
    const content = fs.readFileSync(path.join(pDataDir, file), 'utf-8');
    const records = parseCSV(content);
    const source = extractSource(file);
    
    let inserted = 0;
    let skipped = 0;

    const mapping = getColumnMapping(file);

    for (const record of records) {
      let lat = mapping.lat ? parseFloat(record[mapping.lat] || '0') : 0;
      let lng = mapping.lng ? parseFloat(record[mapping.lng] || '0') : 0;
      
      // 위도/경도 없으면 스킵 (Kakao API 연동 필요)
      if (!lat || !lng) {
        skipped++;
        continue;
      }

      const { data: existing } = await supabase
        .from('smoking_areas')
        .select('id')
        .eq('latitude', lat)
        .eq('longitude', lng)
        .eq('is_public_data', true)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('smoking_areas')
        .insert({
          name: record[mapping.name] || '흡연구역',
          address: record[mapping.address] || '',
          latitude: lat,
          longitude: lng,
          is_indoor: (record[mapping.indoor] || '').includes('실내'),
          is_public_data: true,
          public_data_source: source,
          public_data_updated_at: new Date().toISOString(),
          verification_count: 10,
          is_verified: true,
        });

      if (error) {
        console.error('❌ 삽입 실패:', error.message);
        skipped++;
      } else {
        inserted++;
      }
    }

    console.log(`✅ ${inserted}개 추가, ⏭️ ${skipped}개 스킵`);
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  console.log(`\n🎉 완료! 총 ${totalInserted}개 추가, ${totalSkipped}개 스킵`);
}

syncCSV().catch(console.error);
