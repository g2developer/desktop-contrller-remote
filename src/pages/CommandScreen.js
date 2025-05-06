import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonFooter, 
  IonButton, 
  IonTextarea,
  IonIcon, 
  IonButtons, 
  IonBackButton,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { send, star, timeOutline } from 'ionicons/icons';
import { useAuth } from '../components/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import QuickCommands from '../components/QuickCommands';
import './CommandScreen.css';

const CommandScreen = () => {
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    "오늘 날씨 어때?",
    "내일 일정 알려줘",
    "마케팅 제안서 작성해줘",
    "영어로 이메일 번역해줘"
  ]);
  const { socket } = useAuth();

  const sendCommand = (cmd) => {
    if (!cmd.trim()) return;
    
    setIsExecuting(true);
    
    // 테스트용 - 소켓 대신 타이머 사용
    setTimeout(() => {
      setIsExecuting(false);
      setToastMessage('명령이 성공적으로 전송되었습니다.');
      setShowToast(true);
      
      // 명령 이력에 추가
      if (!commandHistory.includes(cmd)) {
        setCommandHistory(prev => [cmd, ...prev]);
      }
      
      setCommand('');
    }, 1000);
    
    // 실제 소켓 사용 시 코드 (현재는 테스트용으로 비활성화)
    if (socket) {
      socket.emit('execute-command', { command: cmd });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendCommand(command);
  };

  const useQuickCommand = (cmd) => {
    setCommand(cmd);
  };

  const useHistoryCommand = (cmd) => {
    setCommand(cmd);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/main" />
          </IonButtons>
          <IonTitle>명령 전송</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding command-content">
        <ConnectionStatus />
        
        <div className="command-description">
          <h2>명령 입력</h2>
          <p>AI에게 전송할 명령을 입력하세요. 명령은 자동으로 AI 채팅창에 입력되고 전송됩니다.</p>
        </div>
        
        <QuickCommands onSelectCommand={useQuickCommand} />
        
        {commandHistory.length > 0 && (
          <div className="history-section">
            <div className="section-header">
              <IonIcon icon={timeOutline} />
              <h3>최근 명령 이력</h3>
            </div>
            <div className="history-list">
              {commandHistory.map((cmd, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => useHistoryCommand(cmd)}
                >
                  <IonIcon icon={star} className="history-icon" />
                  <span className="history-text">{cmd}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </IonContent>
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
              rows={2}
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

export default CommandScreen;