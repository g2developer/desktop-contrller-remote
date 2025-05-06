import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonLoading,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonList
} from '@ionic/react';
import { lockClosed, person, wifi, desktop, refreshCircle, warningOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Preferences } from '@capacitor/preferences';
import './Login.css';

const Login = () => {
  const [serverAddress, setServerAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [portMessage, setPortMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  
  const { login, isAuthenticated } = useAuth();
  const history = useHistory();
  
  // 저장된 서버 주소와 사용자 이름 불러오기
  useEffect(() => {
    const loadSavedData = async () => {
      const { value: savedServer } = await Preferences.get({ key: 'last_server_address' });
      const { value: savedUsername } = await Preferences.get({ key: 'last_username' });
      
      if (savedServer) setServerAddress(savedServer);
      if (savedUsername) setUsername(savedUsername);
    };
    
    loadSavedData();
  }, []);
  
  // 인증 상태 변화 감지하여 메인 페이지로 이동
  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/main');
    }
  }, [isAuthenticated, history]);

  // 디버그 정보 추가 함수
  const addDebugInfo = (message) => {
    setDebugInfo(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message
    }]);
  };

  // 스토리지 초기화 함수
  const clearStorageData = async () => {
    try {
      addDebugInfo('스토리지 초기화 시작...');
      const keys = ['auth_token', 'user_info', 'server_address', 'last_server_address', 'last_username', 'command_history'];
      for (const key of keys) {
        await Preferences.remove({ key });
      }
      addDebugInfo('스토리지 초기화 완료');
      setServerAddress('');
      setUsername('');
      setPassword('');
    } catch (error) {
      addDebugInfo(`스토리지 초기화 오류: ${error.message}`);
    }
  };

  // 로그인 처리
  const handleLogin = async () => {
    // 입력값 검증
    if (!serverAddress.trim()) {
      setAlertMessage('서버 주소를 입력해주세요.');
      setShowAlert(true);
      return;
    }
    
    if (!username.trim()) {
      setAlertMessage('아이디를 입력해주세요.');
      setShowAlert(true);
      return;
    }
    
    if (!password.trim()) {
      setAlertMessage('비밀번호를 입력해주세요.');
      setShowAlert(true);
      return;
    }

    // 로딩 표시
    setShowLoading(true);
    addDebugInfo(`로그인 시도: ${serverAddress}`);
    
    try {
      // 입력 정보 로컬에 저장 (비밀번호는 저장하지 않음)
      await Preferences.set({ key: 'last_server_address', value: serverAddress });
      await Preferences.set({ key: 'last_username', value: username });
      
      // 로그인 시도
      const result = await login(serverAddress, username, password);
      addDebugInfo(`로그인 결과: ${result.success ? '성공' : '실패'}`);
      
      if (!result.success) {
        setAlertMessage(result.message || '로그인에 실패했습니다.');
        setShowAlert(true);
        addDebugInfo(`실패 이유: ${result.message || '알 수 없음'}`);
      }
      // 성공 시 AuthContext에서 자동으로 /main으로 리다이렉트
    } catch (error) {
      console.error('Login error:', error);
      setAlertMessage('로그인 중 오류가 발생했습니다.');
      setShowAlert(true);
      addDebugInfo(`로그인 오류: ${error.message}`);
    } finally {
      setShowLoading(false);
    }
  };

  // 서버 주소 입력 필드에 포커스가 있을 때 도움말 표시
  const handleServerAddressFocus = () => {
    setPortMessage('서버 주소는 IP:포트번호 형식으로 입력해주세요. (예: 192.168.0.1:3000)');
  };

  // 서버 주소 입력 필드에서 포커스가 사라질 때 도움말 제거
  const handleServerAddressBlur = () => {
    setPortMessage('');
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="login-container">
          <div className="logo-container">
            <div className="app-icon">
              <IonIcon icon={desktop} />
            </div>
            <h1>Desktop Controller</h1>
            <p>원격으로 데스크탑을 제어하세요</p>
          </div>
          
          <IonGrid>
            <IonRow>
              <IonCol>
                <div className="input-container">
                  <IonItem className="custom-input">
                    <IonIcon icon={wifi} slot="start" />
                    <IonLabel position="floating">서버 주소</IonLabel>
                    <IonInput
                      type="text"
                      value={serverAddress}
                      onIonChange={e => setServerAddress(e.detail.value)}
                      placeholder="예: 192.168.0.1:3000"
                      onIonFocus={handleServerAddressFocus}
                      onIonBlur={handleServerAddressBlur}
                    />
                  </IonItem>
                  {portMessage && (
                    <IonText color="medium" className="port-info">
                      <p>{portMessage}</p>
                    </IonText>
                  )}
                </div>
              </IonCol>
            </IonRow>
            
            <IonRow>
              <IonCol>
                <div className="input-container">
                  <IonItem className="custom-input">
                    <IonIcon icon={person} slot="start" />
                    <IonLabel position="floating">아이디</IonLabel>
                    <IonInput
                      type="text"
                      value={username}
                      onIonChange={e => setUsername(e.detail.value)}
                    />
                  </IonItem>
                </div>
              </IonCol>
            </IonRow>
            
            <IonRow>
              <IonCol>
                <div className="input-container">
                  <IonItem className="custom-input">
                    <IonIcon icon={lockClosed} slot="start" />
                    <IonLabel position="floating">비밀번호</IonLabel>
                    <IonInput
                      type="password"
                      value={password}
                      onIonChange={e => setPassword(e.detail.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLogin();
                        }
                      }}
                    />
                  </IonItem>
                </div>
              </IonCol>
            </IonRow>
            
            <IonRow>
              <IonCol>
                <IonButton 
                  expand="block"
                  onClick={handleLogin}
                  className="login-button"
                  disabled={!serverAddress.trim() || !username.trim() || !password.trim() || showLoading}
                >
                  로그인
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow className="ion-margin-top">
              <IonCol>
                <div className="debug-toggle">
                  <IonButton 
                    fill="clear" 
                    size="small" 
                    onClick={() => setShowDebug(!showDebug)}
                    className="debug-button"
                  >
                    {showDebug ? '디버그 정보 숨기기' : '디버그 정보 표시'}
                  </IonButton>
                  {showDebug && (
                    <IonButton 
                      fill="clear" 
                      size="small" 
                      onClick={clearStorageData}
                      color="danger"
                      className="clear-button"
                    >
                      <IonIcon icon={refreshCircle} slot="start" />
                      초기화
                    </IonButton>
                  )}
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {showDebug && (
            <div className="debug-container">
              <IonText color="medium">
                <h4>디버깅 정보</h4>
              </IonText>
              <div className="server-info">
                <p><strong>중요:</strong> 웹소켓 오류 "ws://192.168.0.2:6000/socket.io/?EIO=4&transport=websocket"가 발생하면, 서버가 실행 중인지 확인하고 올바른 포트 번호를 사용하세요.</p>
              </div>
              <IonList className="debug-list">
                {debugInfo.length === 0 ? (
                  <p className="no-debug">로그인을 시도하면 디버그 정보가 표시됩니다.</p>
                ) : (
                  debugInfo.map((item, index) => (
                    <div key={index} className="debug-item">
                      <span className="debug-time">{item.time}</span>
                      <span className="debug-message">{item.message}</span>
                    </div>
                  ))
                )}
              </IonList>
            </div>
          )}
        </div>
        
        <IonLoading
          isOpen={showLoading}
          message={'연결 중...'}
        />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'알림'}
          message={alertMessage}
          buttons={['확인']}
        />
      </IonContent>

      <IonFooter className="ion-no-border" style={{ display: showDebug ? 'block' : 'none' }}>
        <IonToolbar>
          <div className="footer-note">
            <IonIcon icon={warningOutline} color="warning" />
            <span>서버에 연결할 수 없는 경우 포트 번호와 방화벽 설정을 확인하세요.</span>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Login;