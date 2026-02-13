# 데이터베이스 구조

## ERD

```
smoking_areas (흡연구역)
├── id (UUID, PK)
├── name (VARCHAR)
├── latitude (DECIMAL)
├── longitude (DECIMAL)
├── address (VARCHAR)
├── is_indoor (BOOLEAN)
├── verification_count (INTEGER)
├── is_verified (BOOLEAN)
└── created_at (TIMESTAMP)

reviews (리뷰)
├── id (UUID, PK)
├── area_id (UUID, FK → smoking_areas.id)
├── cleanliness (INTEGER, 1-5)
├── is_available (BOOLEAN)
├── comment (TEXT)
└── created_at (TIMESTAMP)
```

---

## 테이블 상세

### smoking_areas
흡연구역 위치 및 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 흡연구역 고유 ID |
| name | VARCHAR(100) | 장소명 |
| latitude | DECIMAL(10,8) | 위도 |
| longitude | DECIMAL(11,8) | 경도 |
| address | VARCHAR(255) | 주소 |
| is_indoor | BOOLEAN | 실내 여부 |
| verification_count | INTEGER | 제보 횟수 |
| is_verified | BOOLEAN | 검증 완료 여부 (3명 이상) |
| created_at | TIMESTAMP | 제보일 |

### reviews
흡연구역 리뷰

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 리뷰 고유 ID |
| area_id | UUID | 흡연구역 ID |
| cleanliness | INTEGER | 청결도 (1-5) |
| is_available | BOOLEAN | 이용 가능 여부 |
| comment | TEXT | 코멘트 |
| created_at | TIMESTAMP | 작성일 |

---

## 인덱스

```sql
CREATE INDEX idx_smoking_areas_location ON smoking_areas(latitude, longitude);
CREATE INDEX idx_reviews_area ON reviews(area_id);
```
