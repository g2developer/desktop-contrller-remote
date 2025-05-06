import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Preferences } from '@capacitor/preferences';

// 페이지 컴포넌트
import Login from './pages/Login';
import Main from './pages/Main';

// 인증 컨텍스트
import { AuthProvider } from './components/AuthContext';

// 필수 CSS
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// 테마 변수
import './theme/variables.css';

// Ionic 설정
setupIonicReact({
  mode: 'ios', // iOS 디자인 가이드라인 적용
  animated: true
});

// 스토리지 초기화 함수
const clearAllStorage = async () => {
  try {
    // 강제로 이전 환경 설정 데이터 초기화 (디버깅 용도)
    // 실제 배포 시에는 이 부분을 주석 처리하거나 제거해야 합니다
    const keys = ['auth_token', 'user_info', 'server_address', 'last_server_address', 'last_username', 'command_history'];
    for (const key of keys) {
      await Preferences.remove({ key });
    }
    console.log('스토리지 초기화 완료');
  } catch (error) {
    console.error('스토리지 초기화 중 오류:', error);
  }
};

const App = () => {
  // 앱 시작 시 데이터 초기화 (테스트/디버깅 용도)
  useEffect(() => {
    // 다음 줄의 주석을 해제하면 모든 저장 데이터를 초기화합니다
    // clearAllStorage();
    
    // 디버깅 및 버전 정보
    console.log('앱 버전:', '1.0.0');
    console.log('환경:', process.env.NODE_ENV);
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/main" component={Main} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;