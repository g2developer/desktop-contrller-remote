# 데스크탑 컨트롤러 모바일 앱 (클라이언트)

이 앱은 Ionic/React 기반의 모바일 애플리케이션으로, 데스크탑 컨트롤러 서버에 연결하여 원격으로 AI 명령을 전송하고 결과를 확인할 수 있습니다.

## 주요 기능

1. **PC 앱 접속 기능**
   - ID/PW 방식으로 로그인
   - 서버 주소 입력으로 유연한 연결
   - 접속 상태 실시간 확인
   - 안전한 세션 관리 및 자동 재연결 기능

2. **명령 전송 기능**
   - AI에게 명령 메시지 전송
   - 빠른 명령 템플릿 제공
   - 명령 이력 관리
   - 음성 인식을 통한 명령 입력 지원

3. **AI 응답 화면 확인 기능**
   - 데스크탑 AI 응답 영역만 선택적으로 확인
   - 실시간 또는 자동 새로고침 모드
   - 화면 확대/축소 기능
   - 응답 이력 관리
   - 스크린샷 저장 및 공유 기능

4. **응답 분석 및 관리**
   - AI 응답의 텍스트 추출 기능 (OCR)
   - 응답 북마크 및 태그 지정
   - 응답 내용 검색 기능
   - 카테고리별 응답 분류 및 정리

5. **명령 스크립트 및 자동화**
   - 명령 시퀀스 생성 및 저장
   - 시나리오 기반 대화 자동화
   - 조건부 응답 처리 로직
   - 저장된 스크립트 공유 기능

6. **푸시 알림 및 알림**
   - AI 응답 완료 시 푸시 알림
   - 서버 연결 상태 변경 알림
   - 중요 키워드 기반 알림 설정
   - 백그라운드 모드에서도 작동

7. **오프라인 모드**
   - 이전 응답 내역 오프라인 접근
   - 오프라인 상태에서 명령 대기열 작성
   - 네트워크 복구 시 자동 동기화
   - 데이터 사용량 최적화 옵션

8. **다중 서버 연결**
   - 여러 데스크탑 서버 관리
   - 서버 간 빠른 전환
   - 서버별 설정 및 사용자 정보 저장
   - 멀티 프로필 지원

## 프로젝트 구조

```
desktop-contrller-remote/
├── capacitor.config.ts    # Capacitor 설정
├── ionic.config.json      # Ionic 설정
├── package.json           # 프로젝트 설정 및 의존성
├── tsconfig.json          # TypeScript 설정
└── src/
    ├── index.tsx          # 앱 진입점
    ├── App.tsx            # 메인 앱 컴포넌트
    ├── theme/
    │   └── variables.css  # Ionic 테마 변수
    ├── pages/
    │   ├── Login.tsx      # 로그인 페이지
    │   ├── Main.tsx       # 메인 화면
    │   ├── CommandScreen.tsx  # 명령 전송 화면
    │   └── ResponseScreen.tsx # AI 응답 확인 화면
    ├── components/
    │   └── AuthContext.tsx   # 인증 컨텍스트
    └── assets/            # 이미지, 아이콘 등
```

## 기술 스택

- **Ionic Framework**: 크로스 플랫폼 모바일 UI 프레임워크
- **React**: 사용자 인터페이스 라이브러리
- **TypeScript**: 타입 안정성이 강화된 JavaScript
- **Socket.io Client**: 실시간 양방향 통신
- **Capacitor**: 네이티브 앱 배포 브릿지
- **Tesseract.js**: OCR(광학 문자 인식) 기능
- **React Navigation**: 화면 네비게이션
- **Secure Storage**: 암호화된 데이터 저장
- **Firebase Cloud Messaging**: 푸시 알림
- **LocalForage**: 오프라인 데이터 관리

## 개발 환경 설정

### 필수 요구사항

- Node.js 14.x 이상
- npm 6.x 이상
- iOS 빌드를 위한 Mac OS 및 Xcode (iOS 빌드 시)
- Android 빌드를 위한 Android Studio (Android 빌드 시)

### 설치 및 실행

1. 의존성 패키지 설치
   ```bash
   npm install
   ```

2. 웹 브라우저에서 개발 모드로 실행
   ```bash
   npm start
   ```

3. 라이브 리로드 모드로 실행
   ```bash
   npm run dev
   ```

## 모바일 앱 빌드

### Android 앱 빌드
```bash
npm run build
npx cap add android
npx cap copy android
npx cap open android
```

### iOS 앱 빌드 (Mac OS 환경 필요)
```bash
npm run build
npx cap add ios
npx cap copy ios
npx cap open ios
```

## 앱 기능 사용 방법

### 로그인 및 서버 연결
1. 로그인 화면에서 데스크탑 앱이 실행 중인 서버 주소를 입력합니다.
2. 데스크탑 앱에 등록된 사용자 계정으로 로그인합니다.
3. "서버 저장" 옵션을 선택하여 다음 로그인 시 자동으로 서버 주소를 불러올 수 있습니다.
4. 다중 서버를 설정하려면 "서버 관리" 메뉴에서 여러 서버를 추가하고 이름을 지정할 수 있습니다.

### 명령 전송
1. 명령 전송 화면에서 AI에게 전달할 명령을 입력합니다.
2. 빠른 명령 템플릿을 탭하여 자주 사용하는 명령을 빠르게 입력할 수 있습니다.
3. 마이크 아이콘을 탭하여 음성 인식을 통해 명령을 입력할 수 있습니다.
4. 명령 이력에서 이전 명령을 선택하여 재사용할 수 있습니다.
5. 명령 시퀀스를 생성하려면 "스크립트" 탭에서 여러 명령을 순서대로 추가합니다.

### AI 응답 확인
1. AI 응답 확인 화면에서 명령 실행 결과를 실시간으로 확인할 수 있습니다.
2. 자동 새로고침 버튼을 누르면 5초마다 화면이 갱신됩니다.
3. 확대/축소 버튼을 통해 응답 화면을 전체 화면으로 볼 수 있습니다.
4. 응답 이미지를 길게 누르면 저장 또는 공유 옵션이 표시됩니다.
5. OCR 버튼을 탭하여 이미지에서 텍스트를 추출할 수 있습니다.

### 응답 관리
1. 응답 관리 화면에서 이전 응답들을 날짜별로 확인할 수 있습니다.
2. 응답에 태그를 추가하여 분류하고 검색할 수 있습니다.
3. 중요한 응답은 별표 표시를 통해 북마크할 수 있습니다.
4. 검색 기능을 사용하여 응답 내용이나 태그로 검색할 수 있습니다.
5. 폴더를 생성하여 응답을 체계적으로 정리할 수 있습니다.

### 스크립트 및 자동화
1. 스크립트 편집기에서 새 스크립트를 생성합니다.
2. 명령 시퀀스를 추가하고 각 명령 사이의 대기 시간을 설정합니다.
3. 조건부 로직을 통해 AI 응답에 따라 다른 명령을 실행할 수 있습니다.
4. 생성된 스크립트를 저장하고 필요할 때 실행할 수 있습니다.
5. 스크립트를 다른 기기와 공유하거나 가져올 수 있습니다.

## UI/UX 특징

- **iOS 디자인 가이드라인**: Apple의 Human Interface Guidelines 준수
- **심플한 인터페이스**: 직관적이고 사용하기 쉬운 디자인
- **다크 모드 지원**: 시스템 설정에 따라 자동으로 테마 변경
- **접근성 지원**: 화면 확대, 보이스오버, 고대비 모드 지원
- **애니메이션 및 전환 효과**: 부드러운 사용자 경험을 위한 시각적 피드백
- **사용자 맞춤 설정**: 앱 테마, 폰트 크기, 레이아웃 조정 가능

## 성능 최적화

- **이미지 캐싱**: 네트워크 사용량 감소 및 로딩 시간 단축
- **지연 로딩**: 필요한 컴포넌트만 로드하여 앱 시작 시간 최적화
- **배터리 효율성**: 백그라운드 작업 최소화 및 새로고침 간격 조정
- **메모리 관리**: 응답 이력 자동 정리 및 캐시 크기 제한
- **네트워크 최적화**: 압축 및 효율적인 데이터 전송 형식 사용

## 주의사항

- 이 앱은 로컬 네트워크 내에서 사용하도록 설계되었습니다.
- 보안 연결(HTTPS)을 사용하는 것이 권장됩니다.
- 모바일 디바이스의 절전 모드가 화면 갱신에 영향을 줄 수 있습니다.
- OCR 기능의 정확도는 이미지 품질에 따라 달라질 수 있습니다.
- 푸시 알림을 사용하려면 Firebase 프로젝트 설정이 필요합니다.
- 배터리 수명을 연장하려면 자동 새로고침 간격을 늘리는 것이 좋습니다.

## 지원 및 피드백

앱 사용 중 문제가 발생하거나 새로운 기능을 제안하려면 GitHub 이슈 트래커를 통해 피드백을 제출해 주세요. 개발팀은 지속적으로 앱을 개선하기 위해 사용자 의견을 적극 반영하고 있습니다.
