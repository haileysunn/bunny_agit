# 🐰 bunnyAgit

<div align="center">
  <img src="public/assets/images/logo_rabbit.png" alt="bunnyAgit Logo" width="200"/>
  
  ### 길 위에서 찾은 우리만의 아지트
  **흡연자들을 위한 특별한 공간 정보 공유 플랫폼**
  
  [![Built with Amazon Q](https://img.shields.io/badge/Built%20with-Amazon%20Q-FF9900?logo=amazon-aws)](https://aws.amazon.com/q/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/version-1.0.0-7C4DFF)]()
</div>

---

## 🌟 브랜드 스토리

### "토끼처럼 빠르게, 아지트처럼 편안하게"

bunnyAgit은 단순한 흡연구역 찾기를 넘어, **흡연자들의 커뮤니티 공간**을 만들어갑니다.

#### 🐇 왜 토끼인가요?

- **빠른 정보 공유**: 토끼의 민첩함처럼, 실시간으로 업데이트되는 흡연구역 정보
- **커뮤니티 연결**: 토끼굴처럼 연결된 사용자들의 네트워크
- **안전한 은신처**: 토끼의 보금자리처럼, 편안하게 쉴 수 있는 공간 제공

#### 🗺️ 우리의 미션

> "길 위의 모든 흡연자가 편안하게 쉴 수 있는 아지트를 찾을 수 있도록"

**우리가 해결하는 문제들:**
- ❌ 흡연구역을 찾아 헤매는 시간
- ❌ 불친절한 시설 환경
- ❌ 정보 부족으로 인한 불편함

**bunnyAgit의 솔루션:**
- ✅ 지도 기반 실시간 정보 제공
- ✅ 커뮤니티 기반 리뷰 시스템
- ✅ 기여에 대한 보상 시스템

---

## ✨ 주요 기능

### 🗺️ 스마트 지도
- Kakao Maps 기반 실시간 흡연구역 표시
- 현재 위치 중심 자동 탐색
- 🔍 **실시간 검색 기능** (이름/주소 검색)
- 마커 클릭으로 상세 정보 확인
- 내 위치로 이동 버튼

### 🥕 아지트 제보
- 새로운 흡연구역 등록
- 위치 정보 자동 입력 (GPS)
- 100m 이내 제보 검증 시스템
- 3명 이상 제보 시 지도에 표시
- 실내/실외 정보 제공

### ⭐ 리뷰 시스템
- 5점 척도 청결도 평가
- 이용 가능 여부 체크
- 실시간 신뢰도 점수 (최근 7일 기준)
- 사용자 코멘트 작성
- 최신 리뷰 목록 표시

### 🎨 UI/UX 특징
- **다크모드/라이트모드** 지원
- ESC 키로 모달 빠르게 닫기
- 로딩 스피너로 상태 표시
- 토스트 알림으로 즉각적인 피드백

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS

### Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

### External APIs
- **Map**: Kakao Maps API
- **Location**: Geolocation API

### Development Tools
- **AI Assistant**: Amazon Q Developer (Vibe Coding)
- **Version Control**: Git
- **Package Manager**: npm

---

## 📦 시작하기

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/haileysunn/bunny_agit.git
cd bunny_agit
```

### 2️⃣ 의존성 설치

```bash
npm install
```

### 3️⃣ 환경 변수 설정

`.env.local` 파일을 생성하고 다음 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key
```

> 💡 **API 키 발급 방법**: [API 설정 가이드](docs/API_SETUP.md) 참고

### 4️⃣ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🎮 사용 가이드

### 처음 시작하기

1. **🗺️ 지도 탐색**
   - 현재 위치 주변 흡연구역 자동 표시
   - 마커 클릭으로 상세 정보 확인

2. **🔍 검색 기능**
   - 아지트 이름이나 주소로 검색
   - 실시간 검색 결과 표시

### 커뮤니티 참여

3. **🥕 아지트 제보**
   - 새로운 흡연구역 발견 시 제보
   - 위치, 편의시설 정보 입력
   - 3명 이상 제보 시 지도에 표시

4. **⭐ 리뷰 작성**
   - 청결도, 이용 가능성 평가
   - 솔직한 코멘트 공유
   - 다른 사용자에게 도움 제공

---

## 🎨 브랜드 아이덴티티

### 컬러 팔레트

| 컬러 | 샘플 | 용도 |
|------|------|------|
| **Purple** | ![#5B26A8](https://img.shields.io/badge/-5B26A8-5B26A8?style=flat-square&logoColor=white) | Primary, 브랜드 메인 컬러 |
| **Black** | ![#000000](https://img.shields.io/badge/-000000-000000?style=flat-square&logoColor=white) | Background, 배경 |
| **Gold** | ![#F9A825](https://img.shields.io/badge/-F9A825-F9A825?style=flat-square&logoColor=white) | Accent, 강조 및 CTA |
| **White** | ![#FFFFFF](https://img.shields.io/badge/-FFFFFF-FFFFFF?style=flat-square&logoColor=black) | Text, 텍스트 |
| **Gray** | ![#9E9E9E](https://img.shields.io/badge/-9E9E9E-9E9E9E?style=flat-square&logoColor=white) | Secondary Text |

### 디자인 철학

- **친근하고 유쾌하게**: 딱딱하지 않은 커뮤니티 분위기
- **직관적이고 명확하게**: 필요한 정보를 빠르게 전달
- **긍정적이고 격려하는**: 사용자의 기여를 응원

### 브랜드 가치

**1. 공유 (Share)**
내가 아는 좋은 장소를 다른 사람들과 나눕니다.

**2. 신뢰 (Trust)**
실제 사용자들의 리뷰와 평가로 만드는 신뢰.

**3. 보상 (Reward)**
기여한 만큼 돌려받는 포인트 시스템.

**4. 편의 (Convenience)**
직관적인 지도 기반 인터페이스.

---

## 📊 데이터베이스 구조

### 테이블 구성

- **smoking_areas**: 흡연구역 위치 및 정보
- **reviews**: 리뷰 (청결도, 이용가능 여부, 코멘트)

> 📖 자세한 스키마는 [데이터베이스 문서](docs/DATABASE.md) 참고

---

## 🌈 bunnyAgit의 차별점

| Before | After |
|--------|-------|
| 😰 흡연구역 찾아 헤맴 | 😊 앱으로 빠르게 찾기 |
| 😞 정보 없어서 불안 | 😄 리뷰로 미리 확인 |
| 😣 혼자만 아는 정보 | 🤝 모두와 공유하는 지식 |
| 😐 의미 없는 발품 | 🎁 포인트로 보상받기 |

---

## 📚 문서

- 📘 [API 설정 가이드](docs/API_SETUP.md) - Supabase, Kakao Maps 설정
- 📗 [기능 명세서](docs/FEATURES.md) - 상세 기능 설명
- 📕 [데이터베이스 구조](docs/DATABASE.md) - 스키마 및 관계
- 📙 [프로젝트 구조](docs/PROJECT_STRUCTURE.md) - 디렉토리 구조

---

## 🙏 감사의 말

이 프로젝트는 [Amazon Q Developer](https://aws.amazon.com/q/)의 **Vibe Coding** 기능을 활용하여 개발되었습니다.

Vibe Coding을 통해 아이디어부터 완성까지 빠르게 구현할 수 있었으며, 개발 과정에서 많은 시간을 절약할 수 있었습니다.

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 👤 개발자

**haileysunn**

- GitHub: [@haileysunn](https://github.com/haileysunn)
- Email: haileysunn.o3o@gmail.com

---

## 🐰 우리의 비전

**"모든 길 위에 편안한 아지트를"**

bunnyAgit은 단순한 앱을 넘어, 흡연자들의 일상을 더 나은 방향으로 바꾸는 **라이프스타일 플랫폼**으로 성장합니다. 

서로 도우며 함께 만들어가는 커뮤니티, 그 중심에 여러분이 있습니다.

---

<div align="center">
  
  **⭐ 이 프로젝트가 마음에 드셨나요? Star를 눌러주세요! ⭐**
  
  **함께 만드는 우리만의 아지트 🐰🥕**
  
  [🚀 시작하기](#-시작하기) | [📖 문서 보기](#-문서) | [🤝 기여하기](#-기여하기)
  
</div>
