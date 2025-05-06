import React, { useState, useEffect, useRef } from 'react';
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
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter
} from '@ionic/react';
import { 
  power, 
  send, 
  refreshOutline,
  timeOutline,
  closeCircle,
  menu,
  arrowBack,
  time,
  chatboxEllipses,
  pulseOutline,
  brain
} from 'ionicons/icons';
import { useAuth } from '../components/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import ModernRemoteDesktopLogo from '../components/ModernRemoteDesktopLogo';
import socketService from '../services/SocketService';
import { Preferences } from '@capacitor/preferences';
import './Main.css';

const Main = () => {
  // 상태 관리
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [lastCommand, setLastCommand] = useState(null);
  const [showFullCommand, setShowFullCommand] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 응답 관련 상태
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // 응답 데이터
  const [response, setResponse] = useState({
    image: '',
    timestamp: new Date().toISOString()
  });

  // 자동 스크롤을 위한 참조
  const contentRef = useRef(null);
  
  const { username, connectionStatus, logout } = useAuth();

  // 뷰가 처음 렌더링될 때 명령어 이력 로드
  useIonViewDidEnter(() => {
    loadCommandHistory();
    requestScreenshot();
  });

  // 소켓 이벤트 리스너 설정
  useEffect(() => {
    // 명령 결과 이벤트 리스너
    const handleCommandResult = (data) => {
      setIsExecuting(false);
      
      if (data.success) {
        setToastMessage('명령이 성공적으로 전송되었습니다.');
      } else {
        setToastMessage(data.message || '명령 전송 중 오류가 발생했습니다.');
      }
      
      setShowToast(true);
    };

    // 로그인 결과 이벤트 리스너 (데스크탑 앱에서는 'login-result'를 사용)
    const handleLoginResult = (data) => {
      console.log('Login result:', data);
    };

    // 명령 수락 이벤트 리스너 (데스크탑 앱에서는 'command-accepted'를 사용)
    const handleCommandAccepted = (data) => {
      console.log('Command accepted:', data);
      setToastMessage('명령이 성공적으로 전송되었습니다.');
      setShowToast(true);
      setIsExecuting(false);
    };

    // 명령 오류 이벤트 리스너 (데스크탑 앱에서는 'command-error'를 사용)
    const handleCommandError = (data) => {
      console.error('Command error:', data);
      setToastMessage(data.message || '명령 전송 중 오류가 발생했습니다.');
      setShowToast(true);
      setIsExecuting(false);
    };

    // AI 응답 이벤트 리스너
    const handleAIResponse = (data) => {
      console.log('AI response received');
      setResponse(data);
      setLoading(false);
    };

    // 이벤트 리스너 등록
    socketService.on('login-result', handleLoginResult);
    socketService.on('command-accepted', handleCommandAccepted);
    socketService.on('command-error', handleCommandError);
    socketService.on('ai-response', handleAIResponse);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      socketService.off('login-result', handleLoginResult);
      socketService.off('command-accepted', handleCommandAccepted);
      socketService.off('command-error', handleCommandError);
      socketService.off('ai-response', handleAIResponse);
    };
  }, []);

  // 자동 새로고침 타이머
  useEffect(() => {
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

  // 명령어 이력 로드
  const loadCommandHistory = async () => {
    try {
      const { value } = await Preferences.get({ key: 'command_history' });
      if (value) {
        const history = JSON.parse(value);
        setCommandHistory(history);
        
        // 마지막 명령어 설정
        if (history.length > 0) {
          setLastCommand(history[0]);
        }
      }
    } catch (error) {
      console.error('Error loading command history:', error);
    }
  };

  // 명령어 이력 저장
  const saveCommandHistory = async (history) => {
    try {
      await Preferences.set({
        key: 'command_history',
        value: JSON.stringify(history)
      });
    } catch (error) {
      console.error('Error saving command history:', error);
    }
  };

  // 명령 전송 함수
  const sendCommand = (cmd) => {
    if (!cmd.trim()) return;
    
    setIsExecuting(true);
    
    // 최근 명령 설정
    setLastCommand(cmd);
    
    // 명령 이력에 추가
    const updatedHistory = [cmd, ...commandHistory.filter(c => c !== cmd)];
    // 최대 20개 명령어만 유지
    const trimmedHistory = updatedHistory.slice(0, 20);
    
    setCommandHistory(trimmedHistory);
    saveCommandHistory(trimmedHistory);
    
    // 명령 전송 - 데스크탑 앱에서는 'execute-command'가 아닌 'execute-command'를 사용
    socketService.emit('execute-command', { command: cmd });
    
    // 명령 입력창 비우기
    setCommand('');
    
    // 일정 시간 후 스크린샷 요청 (AI가 응답할 시간 고려)
    setTimeout(() => {
      requestScreenshot();
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendCommand(command);
  };

  const useHistoryCommand = (cmd) => {
    setCommand(cmd);
    setShowHistoryModal(false);
  };

  // 스크린샷 요청 함수 - 데스크탑 앱에서는 'request-screenshot'를 사용
  const requestScreenshot = () => {
    if (!socketService.isConnected()) {
      setToastMessage('서버와 연결되어 있지 않습니다.');
      setShowToast(true);
      return;
    }
    
    setLoading(true);
    socketService.emit('request-screenshot');
  };

  // 화면 새로고침 핸들러
  const handleRefresh = (event) => {
    requestScreenshot();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  };

  // 자동 새로고침 토글
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // 로그아웃 처리
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

  // 이미지 데이터 URL 처리
  const getImageUrl = () => {
    if (!response.image) return null;
    
    // 이미 data URL 형태인지 확인
    if (response.image.startsWith('data:')) {
      return response.image;
    }
    
    // Base64 문자열인 경우 data URL로 변환
    try {
      return `data:image/png;base64,${response.image}`;
    } catch (error) {
      console.error('Error processing image data:', error);
      return null;
    }
  };

  // 응답 타임스탬프 포맷팅
  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return new Date().toLocaleString();
    }
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
      
      <IonContent className="ion-padding main-content content-container" scrollEvents={true} fullscreen={true} ref={contentRef}>
        <ConnectionStatus />
        
        {/* 최근 명령어 표시 - 명령 입력창 위까지 크기 조정 */}
        <div>
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
                    <ModernRemoteDesktopLogo 
                      width={18} 
                      height={18} 
                      primaryColor="#93C5FD" 
                      secondaryColor="#60A5FA" 
                      accentColor="#93C5FD"
                    />
                    <span>{formatTimestamp(response.timestamp)}</span>
                  </div>
                  
                  {getImageUrl() ? (
                    <div className="ai-response-image">
                      <img 
                        src={getImageUrl()} 
                        alt="AI 응답" 
                        onError={(e) => {
                          console.error('Image load error');
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="test-image">
                      {/* 원격 제어 문양 배경 효과 */}
                      <div className="remote-control-background"></div>
                      <ModernRemoteDesktopLogo 
                        width={180} 
                        height={180} 
                        primaryColor="#60A5FA" 
                        secondaryColor="#3B82F6"
                        accentColor="#93C5FD"
                        className="modern-remote-logo"
                      />
                      <h3 className="test-title">AI 응답 내용</h3>
                      <p className="test-description">아직 응답 화면이 없습니다. 명령을 전송해보세요.</p>
                      <p className="user-info">사용자: {username}</p>
                      <div className="time-display">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#93C5FD" strokeWidth="1.5" />
                          <path d="M12 6V12L16 14" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>마지막 갱신: {formatTimestamp(response.timestamp)}</span>
                      </div>
                    </div>
                  )}
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
              disabled={isExecuting || !socketService.isConnected()}
              className="command-textarea"
              autoGrow={true}
              rows={1}
              maxlength={500}
            />
            <IonButton 
              className="send-button"
              onClick={() => sendCommand(command)} 
              disabled={isExecuting || !command.trim() || !socketService.isConnected()}
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
          {commandHistory.length === 0 ? (
            <div className="empty-history">
              <p>아직 명령 이력이 없습니다.</p>
            </div>
          ) : (
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
          )}
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