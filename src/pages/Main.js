import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton, 
  IonIcon, 
  IonButtons,
  IonAlert,
  IonTextarea,
  IonSpinner,
  IonToast,
  IonModal,
  IonFooter,
  IonBackButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { 
  power, 
  send, 
  refreshOutline,
  timeOutline,
  closeCircle,
  menu,
  arrowBack,
  time
} from 'ionicons/icons';
import { useAuth } from '../components/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import './Main.css';

const Main = () => {
  // 상태 관리
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    "오늘 날씨 어때?",
    "내일 일정 알려줘",
    "마케팅 제안서 작성해줘",
    "영어로 이메일 번역해줘",
    "다음 주 회의 준비자료 요약해줘",
    "주간 보고서 작성해줄래?"
  ]);
  const [lastCommand, setLastCommand] = useState(null);
  const [showFullCommand, setShowFullCommand] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 응답 관련 상태
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // 테스트용 가상 응답 데이터
  const [response, setResponse] = useState({
    image: '',
    timestamp: new Date().toISOString()
  });

  const { username, connectionStatus, logout, socket } = useAuth();

  useEffect(() => {
    // 명령 결과 이벤트 리스너
    if (socket) {
      socket.on('command-result', (data) => {
        if (data.success) {
          setToastMessage('명령이 성공적으로 전송되었습니다.');
          setShowToast(true);
        }
      });

      // AI 응답 이벤트 리스너
      socket.on('ai-response', (data) => {
        setResponse(data);
        setLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('command-result');
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

  // 명령 전송 함수
  const sendCommand = (cmd) => {
    if (!cmd.trim()) return;
    
    setIsExecuting(true);
    
    // 테스트용 - 타이머 사용
    setTimeout(() => {
      setIsExecuting(false);
      setToastMessage('명령이 성공적으로 전송되었습니다.');
      setShowToast(true);
      
      // 최근 명령 설정
      setLastCommand(cmd);
      
      // 명령 이력에 추가
      if (!commandHistory.includes(cmd)) {
        setCommandHistory(prev => [cmd, ...prev]);
      }
      
      setCommand('');

      // 새 응답 추가 (테스트용)
      setResponse({
        image: '',
        timestamp: new Date().toISOString()
      });
    }, 1500);
    
    // 실제 소켓 사용 시 코드
    if (socket) {
      socket.emit('execute-command', { command: cmd });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendCommand(command);
  };

  const useHistoryCommand = (cmd) => {
    setCommand(cmd);
    setShowHistoryModal(false);
  };

  // 응답 관련 함수
  const requestScreenshot = () => {
    if (!socket) return;
    
    setLoading(true);
    
    // 테스트용 - 타이머 사용
    setTimeout(() => {
      setResponse({
        image: '',
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }, 1000);
    
    // 실제 소켓 사용 시 코드
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

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    logout();
  };

  // 마지막 명령어의 줄 수 계산
  const getCommandLines = (cmd) => {
    if (!cmd) return 0;
    return cmd.split('\n').length;
  };

  // 명령어 텍스트 줄임 처리
  const getTruncatedCommand = (cmd) => {
    if (!cmd) return '';
    const lines = cmd.split('\n');
    if (lines.length > 2) {
      return lines.slice(0, 2).join('\n') + '...';
    }
    return cmd;
  };

  // 렌더링
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowHistoryModal(true)}>
              <IonIcon icon={menu} />
            </IonButton>
          </IonButtons>
          <IonTitle>Desktop Controller</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={power} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding main-content content-container" scrollEvents={true} fullscreen={true}>
        <ConnectionStatus />
        
        {/* 최근 명령어 표시 - 명령 입력창 위까지 크기 조정 */}
        <div style={{ paddingBottom: '60px' }}>
          {lastCommand && (
            <div className="last-command-container" onClick={() => setShowFullCommand(true)}>
              <div className="last-command-label">마지막 명령:</div>
              <div className="last-command-text">
                {getTruncatedCommand(lastCommand)}
                {getCommandLines(lastCommand) > 2 && (
                  <span className="expand-text">더 보기</span>
                )}
              </div>
            </div>
          )}
          
          {/* AI 응답 섹션 */}
          <div className="response-section">
          
            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
              <IonRefresherContent></IonRefresherContent>
            </IonRefresher>
            
            {loading ? (
              <div className="loading-container">
                <IonSpinner name="crescent" />
                <p>AI 응답 화면을 로딩 중입니다...</p>
              </div>
            ) : (
              <div className="response-container">

                <div className="response-image-container">
                  <div className="response-controls-overlay">
                    <IonButton fill="clear" onClick={toggleAutoRefresh} className={autoRefresh ? 'active-button' : ''}>
                      <IonIcon icon={timeOutline} />
                    </IonButton>
                    <IonButton fill="clear" onClick={requestScreenshot}>
                      <IonIcon icon={refreshOutline} />
                    </IonButton>
                  </div>
                  <div className="response-time-overlay">
                    <span>{new Date(response.timestamp).toLocaleString()}</span>
                  </div>
                  {/* 테스트용 더미 이미지 */}
                  <div className="test-image">
                    <div className="test-content">
                      <h3>AI 응답 내용</h3>
                      <p>이 영역에는 실제 AI의 응답 화면이 표시됩니다. 현재는 테스트 모드이므로 샘플 메시지만 표시합니다.</p>
                      <p>응답 시간: {new Date(response.timestamp).toLocaleTimeString()}</p>
                      <p>사용자: {username}</p>
                      <p>테스트 데이터입니다. 실제 사용 시에는 이 부분에 AI 응답 이미지가 표시됩니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </IonContent>
      
      {/* 명령 입력 영역 - 하단에 고정 */}
      <IonFooter>
        <form onSubmit={handleSubmit} className="command-form">
          <div className="textarea-container">
          <IonTextarea
          value={command}
          placeholder="명령을 입력하세요 (여러 줄 입력 가능)"
          onIonChange={e => setCommand(e.detail.value)}
          disabled={isExecuting}
          className="command-textarea"
          autoGrow={true}
          rows={1}
          maxlength={500}
          />
            <IonButton 
              className="send-button"
              onClick={() => sendCommand(command)} 
              disabled={isExecuting || !command.trim()}
            >
              {isExecuting ? <IonSpinner name="dots" /> : <IonIcon icon={send} />}
            </IonButton>
          </div>
        </form>
      </IonFooter>
      
      {/* 이력 모달 */}
      <IonModal 
        isOpen={showHistoryModal} 
        onDidDismiss={() => setShowHistoryModal(false)}
        className="history-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => setShowHistoryModal(false)}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>명령 이력</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="history-modal-content">
          <div className="history-list">
            {commandHistory.map((cmd, index) => (
              <div 
                key={index} 
                className="history-item"
                onClick={() => useHistoryCommand(cmd)}
              >
                <div className="history-item-header">
                  <IonIcon icon={time} className="history-icon" />
                  <span className="history-time">
                    {new Date(Date.now() - index * 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="history-text">
                  {cmd.length > 50 ? cmd.substring(0, 50) + '...' : cmd}
                </div>
              </div>
            ))}
          </div>
        </IonContent>
      </IonModal>
      
      {/* 전체 명령어 보기 모달 */}
      <IonModal 
        isOpen={showFullCommand} 
        onDidDismiss={() => setShowFullCommand(false)}
        className="command-modal"
      >
        <div className="modal-header">
          <h3>마지막 명령</h3>
          <IonButton fill="clear" onClick={() => setShowFullCommand(false)}>
            <IonIcon icon={closeCircle} />
          </IonButton>
        </div>
        <div className="modal-content">
          <p className="full-command">{lastCommand}</p>
        </div>
      </IonModal>
      
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
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color={toastMessage.includes('성공') ? 'success' : 'warning'}
      />
    </IonPage>
  );
};

export default Main;