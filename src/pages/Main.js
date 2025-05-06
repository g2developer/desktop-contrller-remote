import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton, 
  IonIcon, 
  IonButtons,
  IonAlert
} from '@ionic/react';
import { 
  terminal, 
  power, 
  chatbubble, 
  images, 
  chevronForward 
} from 'ionicons/icons';
import { useAuth } from '../components/AuthContext';
import { useHistory } from 'react-router-dom';
import ConnectionStatus from '../components/ConnectionStatus';
import './Main.css';

const Main = () => {
  const { username, connectionStatus, logout, socket } = useAuth();
  const [lastCommandTime, setLastCommandTime] = useState(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // 명령 결과 이벤트 리스너
    if (socket) {
      socket.on('command-result', (data) => {
        if (data.success) {
          setLastCommandTime(new Date());
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('command-result');
      }
    };
  }, [socket]);

  const handleCommandScreen = () => {
    history.push('/command');
  };

  const handleResponseScreen = () => {
    history.push('/response');
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Desktop Controller</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={power} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding main-content">
        <ConnectionStatus />
        
        <div className="welcome-container">
          <div className="app-icon main-icon">
            <IonIcon icon={terminal} />
          </div>
          <h2>안녕하세요, {username}!</h2>
          <p>데스크탑 컨트롤러를 사용하여 원격으로 데스크탑을 제어하세요.</p>
        </div>
        
        <div className="action-cards">
          <div className="card command-card" onClick={handleCommandScreen}>
            <div className="card-content">
              <div className="card-icon">
                <IonIcon icon={chatbubble} />
              </div>
              <div className="card-info">
                <h3>명령 전송</h3>
                <p>AI에게 전송할 명령을 입력합니다</p>
              </div>
              <div className="card-arrow">
                <IonIcon icon={chevronForward} />
              </div>
            </div>
          </div>
          
          <div className="card response-card" onClick={handleResponseScreen}>
            <div className="card-content">
              <div className="card-icon">
                <IonIcon icon={images} />
              </div>
              <div className="card-info">
                <h3>AI 응답 확인</h3>
                <p>AI의 응답 화면을 확인합니다</p>
                {lastCommandTime && (
                  <div className="last-command-time">
                    마지막 명령: {lastCommandTime.toLocaleTimeString()}
                  </div>
                )}
              </div>
              <div className="card-arrow">
                <IonIcon icon={chevronForward} />
              </div>
            </div>
          </div>
        </div>
        
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={'로그아웃'}
          message={'정말 로그아웃하시겠습니까?'}
          buttons={[
            {
              text: '취소',
              role: 'cancel'
            },
            {
              text: '로그아웃',
              handler: confirmLogout
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Main;