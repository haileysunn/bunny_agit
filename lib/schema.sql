-- Supabase에서 실행할 SQL

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(50) UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  rank VARCHAR(20) DEFAULT '새끼 토끼',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 흡연구역 테이블
CREATE TABLE smoking_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(255) NOT NULL,
  is_indoor BOOLEAN DEFAULT false,
  verification_count INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  is_public_data BOOLEAN DEFAULT false,
  public_data_source VARCHAR(100),
  public_data_updated_at TIMESTAMP,
  reporter_id UUID REFERENCES users(id),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 리뷰 테이블
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES smoking_areas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  is_available BOOLEAN DEFAULT true,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 즐겨찾기 테이블
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  area_id UUID REFERENCES smoking_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, area_id)
);

-- 제보 기록 테이블
CREATE TABLE area_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES smoking_areas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  reporter_location_lat DECIMAL(10, 8),
  reporter_location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_smoking_areas_location ON smoking_areas(latitude, longitude);
CREATE INDEX idx_reviews_area ON reviews(area_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_area_reports_user ON area_reports(user_id);

-- 공공데이터 삽입 예시
-- INSERT INTO smoking_areas (name, address, latitude, longitude, is_indoor, is_public_data, public_data_source, public_data_updated_at, verification_count, is_verified)
-- VALUES ('서울시청 흡연구역', '서울 중구 세종대로 110', 37.5663, 126.9779, false, true, '서울시 공공데이터', NOW(), 10, true);
