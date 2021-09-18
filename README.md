# 프로젝트 개요

보라매 크로스핏 운영에 도움이 되는 기능을 제공해주는 사이트 소스 입니다. ([카페 링크 바로가기](https://cafe.naver.com/cfzms))

## 프로젝트 시작 방법

### 1️⃣ . Local Envirment 파일 세팅

- 프로젝트 ROOT에 `.env.local` 파일 추가 후 아래 내용 추가
- 추가하는 네이버 계정에 2차 인증이 세팅 되어있는 경우 API가 동작 실패 합니다. 😢

```
NAVER_ID={네이버 아이디}
NAVER_PW={네이버 패스워드}
```

### 2️⃣ . 프로젝트 의존성 모듈 설치

```bash
npm install
# or
yarn install
```

### 2️⃣ . 프로젝트 시작

```bash
npm run dev
# or
yarn dev
```

## 프로젝트 기여 방법

### 1️⃣ . 브랜치를 추가해주세요! (이슈를 추가해서 기여하면 더욱 더 좋습니다!)

- issue 생성 시 브랜치 명: `feature/#{이슈번호}` or `bugfix/#{이슈번호}`
- issue 미 생성 시 브랜치 명: `feature/{추가 기능 간략 내용}` or `bugfix/{버그 수정 간략 용용}`

### 2️⃣ . PR을 날려주세요

- PR 대상은 `master` 브랜치로 설정해주세요!
- 리뷰어에 `@minemanemo` 추가해주시면 리뷰하고 merge 하겠습니다!
- master 브랜치로 머지 되면 자동 배포 됩니다!
