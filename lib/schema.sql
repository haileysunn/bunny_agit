-- Supabase에서 실행할 SQL

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(50) NOT NULL,
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

-- 인덱스
CREATE INDEX idx_smoking_areas_location ON smoking_areas(latitude, longitude);
CREATE INDEX idx_reviews_area ON reviews(area_id);
