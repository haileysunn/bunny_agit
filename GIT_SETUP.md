# Git 연결 가이드

## 1. Git 초기화

```bash
git init
git add .
git commit -m "Initial commit: BunnyAgit v1.0.0"
```

## 2. GitHub 저장소 생성

1. GitHub 접속 (https://github.com)
2. 우측 상단 "+" → "New repository" 클릭
3. Repository name: `bunnyAgit`
4. Description: `흡연구역 정보 공유 플랫폼`
5. Public 선택
6. **Initialize this repository with:** 모두 체크 해제
7. "Create repository" 클릭

## 3. 원격 저장소 연결

```bash
git remote add origin https://github.com/yourusername/bunnyAgit.git
git branch -M main
git push -u origin main
```

## 4. 이후 커밋

```bash
git add .
git commit -m "커밋 메시지"
git push
```

---

## 로고 파일 위치

로고 이미지를 다음 위치에 저장하세요:

- `public/assets/images/logo_rabbit.png` (메인 로고)
- `public/favicon.ico` (파비콘)

README.md에서 로고 경로 수정:
```markdown
<img src="public/assets/images/logo_rabbit.png" alt="bunnyAgit Logo" width="200"/>
```
