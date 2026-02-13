# API 설정 가이드

## Supabase 설정

### 1. 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 및 가입
2. "New Project" 클릭
3. 프로젝트 이름, 비밀번호, 리전 설정
4. 프로젝트 생성 완료 (약 2분 소요)

### 2. 데이터베이스 스키마 생성
1. 좌측 메뉴에서 "SQL Editor" 선택
2. "New Query" 클릭
3. `lib/schema.sql` 파일 내용 복사 & 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 3. Storage 설정
1. 좌측 메뉴에서 "Storage" 선택
2. "Create a new bucket" 클릭
3. Bucket name: `smoking-area-images`
4. Public bucket: ✅ 체크
5. "Create bucket" 클릭

### 4. API 키 복사
1. 좌측 메뉴에서 "Project Settings" 선택
2. "API" 탭 클릭
3. 다음 정보 복사:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Kakao Maps API 설정

### 1. 애플리케이션 등록
1. [Kakao Developers](https://developers.kakao.com) 접속 및 로그인
2. 상단 메뉴 "내 애플리케이션" 클릭
3. "애플리케이션 추가하기" 클릭
4. 앱 이름 입력 (예: BunnyAgit)
5. 사업자명 입력 (개인은 이름)
6. "저장" 클릭

### 2. 플랫폼 설정
1. 생성한 애플리케이션 선택
2. 좌측 메뉴 "플랫폼" 선택
3. "Web 플랫폼 등록" 클릭
4. 사이트 도메인 입력:
   - 개발: `http://localhost:3000`
   - 배포: 실제 도메인 주소
5. "저장" 클릭

### 3. JavaScript 키 복사
1. 좌측 메뉴 "앱 키" 선택
2. "JavaScript 키" 복사
3. `.env.local` 파일에 `NEXT_PUBLIC_KAKAO_MAP_KEY`로 저장

---

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_KAKAO_MAP_KEY=your-javascript-key
```

⚠️ **주의**: `.env.local` 파일은 Git에 커밋하지 마세요!
