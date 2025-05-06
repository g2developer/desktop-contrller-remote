import React, { useState } from 'react';
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
  IonCol
} from '@ionic/react';
import { lockClosed, person, wifi, desktop } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [serverAddress, setServerAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const history = useHistory();

  // 간단한 테스트 로그인 처리 - 아무 값이나 입력해도 로그인 됨
  const handleLogin = async () => {
    // 빈 값 체크 (최소한의 UX를 위해)
    if (!serverAddress && !username && !password) {
      setAlertMessage('최소 한 개 필드는 입력해주세요.');
      setShowAlert(true);
      return;
    }

    // 로딩 표시 (잠시만 보여줌)
    setShowLoading(true);
    
    // 로딩 효과를 위해 약간의 지연 추가
    setTimeout(() => {
      setShowLoading(false);
      
      // 메인 화면으로 이동
      history.push('/main');
    }, 1000);
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
                    />
                  </IonItem>
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
                >
                  로그인
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
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
    </IonPage>
  );
};

export default Login;