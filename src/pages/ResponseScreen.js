import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton,
  IonSpinner,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonText
} from '@ionic/react';
import { 
  refreshOutline, 
  timeOutline, 
  expandOutline, 
  contractOutline, 
  chevronBack, 
  chevronForward 
} from 'ionicons/icons';
import { useAuth } from '../components/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import './ResponseScreen.css';

const ResponseScreen = () => {
  // 테스트용 가상 응답 데이터
  const sampleResponses = [
    {
      image: '',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString() // 5분 전
    },
    {
      image: '',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString() // 15분 전
    },
    {
      image: '',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString() // 45분 전
    }
  ];

  const [responses, setResponses] = useState(sampleResponses);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const { socket } = useAuth();

  useEffect(() => {
    if (socket) {
      // AI 응답 이벤트 리스너
      socket.on('ai-response', (data) => {
        setResponses(prev => [data, ...prev]);
        setLoading(false);
        setCurrentResponseIndex(0); // 새 응답이 오면 첫 번째 응답으로 이동
      });
    }

    return () => {
      if (socket) {
        socket.off('ai-response');
      }
    };
  }, [socket]);

  useEffect(() => {
    // 자동 새로고침 타이머
    let refreshTimer = null;
    
    if (autoRefresh) {
      refreshTimer = setInterval(() => {
        requestScreenshot();
      }, 5000);  // 5초마다 새로고침
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [autoRefresh]);

  const requestScreenshot = () => {
    if (!socket) return;
    
    setLoading(true);
    socket.emit('request-screenshot');
  };

  const handleRefresh = (event) => {
    requestScreenshot();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const toggleExpand = () => {
    setExpanded(prev => !prev);
  };

  const goToPreviousResponse = () => {
    if (currentResponseIndex < responses.length - 1) {
      setCurrentResponseIndex(prev => prev + 1);
    }
  };

  const goToNextResponse = () => {
    if (currentResponseIndex > 0) {
      setCurrentResponseIndex(prev => prev - 1);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/main" />
          </IonButtons>
          <IonTitle>AI 응답 화면</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleAutoRefresh} className={autoRefresh ? 'active-button' : ''}>
              <IonIcon icon={timeOutline} />
            </IonButton>
            <IonButton onClick={toggleExpand}>
              <IonIcon icon={expanded ? contractOutline : expandOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="response-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <ConnectionStatus />
        
        <div className="refresh-status">
          <IonText color={autoRefresh ? 'primary' : 'medium'}>
            {autoRefresh ? '자동 새로고침 활성화됨 (5초마다)' : '수동 새로고침 모드'}
          </IonText>
          <IonButton fill="clear" onClick={requestScreenshot} className="refresh-button">
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>AI 응답 화면을 로딩 중입니다...</p>
          </div>
        ) : (
          <div className={`response-container ${expanded ? 'expanded' : ''}`}>
            <div className="response-time">
              <IonIcon icon={timeOutline} />
              <IonText>
                {new Date(responses[currentResponseIndex].timestamp).toLocaleString()}
              </IonText>
            </div>
            <div className="response-image-container">
              {/* 테스트용 더미 이미지 */}
              <div className="test-image">
                <div className="test-content">
                  <h3>안녕하세요, 테스트 AI 응답입니다</h3>
                  <p>이 영역에는 실제 AI의 응답 화면이 표시됩니다. 현재는 테스트 모드이므로 샘플 메시지만 표시합니다.</p>
                  <p>응답 인덱스: {currentResponseIndex + 1} / {responses.length}</p>
                  <p>응답 시간: {new Date(responses[currentResponseIndex].timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {responses.length > 1 && (
              <div className="response-navigation">
                <IonButton 
                  fill="clear" 
                  className="nav-button"
                  disabled={currentResponseIndex >= responses.length - 1}
                  onClick={goToPreviousResponse}
                >
                  <IonIcon icon={chevronBack} />
                  <span>이전</span>
                </IonButton>
                <div className="response-counter">
                  {currentResponseIndex + 1} / {responses.length}
                </div>
                <IonButton 
                  fill="clear" 
                  className="nav-button"
                  disabled={currentResponseIndex <= 0}
                  onClick={goToNextResponse}
                >
                  <span>다음</span>
                  <IonIcon icon={chevronForward} />
                </IonButton>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ResponseScreen;