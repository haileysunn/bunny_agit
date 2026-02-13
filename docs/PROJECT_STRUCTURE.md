# 프로젝트 구조

```
bunnyAgit/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 메인 페이지
│   └── globals.css          # 글로벌 스타일
│
├── components/              # React 컴포넌트
│   ├── AuthProvider.tsx    # 인증 컨텍스트 (미사용)
│   ├── GiftShop.tsx        # 기프티콘 교환 (미사용)
│   ├── KakaoMap.tsx        # 카카오맵 컴포넌트
│   ├── LoadingSpinner.tsx  # 로딩 스피너
│   ├── LoginModal.tsx      # 로그인 모달 (미사용)
│   ├── ReportModal.tsx     # 제보 모달
│   ├── ReviewModal.tsx     # 리뷰 모달
│   ├── SearchBar.tsx       # 검색 바
│   └── Toast.tsx           # 토스트 알림
│
├── lib/                     # 유틸리티 & 설정
│   ├── supabase.ts         # Supabase 클라이언트
│   └── schema.sql          # DB 스키마
│
├── docs/                    # 문서
│   ├── API_SETUP.md        # API 설정 가이드
│   ├── FEATURES.md         # 기능 명세서
│   ├── DATABASE.md         # DB 구조
│   └── PROJECT_STRUCTURE.md # 프로젝트 구조
│
├── dev/                     # 개발 문서 (gitignore)
│   ├── TODO.md             # 작업 목록
│   ├── VERCEL_DEPLOY.md    # 배포 가이드
│   └── VERIFICATION_SYSTEM.md # 검증 시스템 설명
│
├── public/                  # 정적 파일
│   └── assets/images/      # 이미지
│
├── .env.local              # 환경 변수 (Git 제외)
├── .gitignore              # Git 제외 파일
├── package.json            # 의존성 관리
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.ts      # Tailwind CSS 설정
├── postcss.config.mjs      # PostCSS 설정
├── next.config.mjs         # Next.js 설정
└── README.md               # 프로젝트 소개
```

---

## 주요 파일 설명

### app/layout.tsx
- 전역 레이아웃
- Kakao Maps SDK 로드
- 메타데이터 설정

### app/page.tsx
- 메인 페이지
- 지도, 검색, 모달 관리
- 상태 관리 (areas, filteredAreas, loading, toast, darkMode)

### components/KakaoMap.tsx
- Kakao Maps API 통합
- 마커 표시 및 인터랙션
- 현재 위치 자동 이동
- 내 위치로 이동 버튼

### components/ReportModal.tsx
- 아지트 제보 폼
- GPS 위치 자동 입력
- 100m 이내 검증
- 실내/실외 체크박스

### components/ReviewModal.tsx
- 리뷰 작성 & 조회
- 평균 청결도 계산
- 신뢰도 점수 표시

### components/SearchBar.tsx
- 검색 입력 폼
- 실시간 검색
- 초기화 버튼

### components/LoadingSpinner.tsx
- 로딩 상태 표시
- 중앙 정렬 스피너

### components/Toast.tsx
- 알림 메시지 표시
- 3초 자동 닫기
- 슬라이드 인 애니메이션

### lib/supabase.ts
- Supabase 클라이언트 초기화
- TypeScript 타입 정의

---

## 기술 스택

### Frontend
- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 CSS

### Backend
- **Supabase**: PostgreSQL DB

### API
- **Kakao Maps API**: 지도 표시

### 개발 도구
- **Amazon Q Developer**: Vibe Coding으로 개발
