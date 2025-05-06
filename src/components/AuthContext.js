import React, { createContext, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

// 인증 컨텍스트 생성 (테스트용 간소화 버전)
const AuthContext = createContext({
  isAuthenticated: true,
  username: '테스트사용자',
  serverAddress: 'http://localhost:3000',
  socket: null,
  login: async () => true,
  logout: () => {},
  connectionStatus: 'connected'
});

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 제공자 컴포넌트 (테스트용 간소화 버전)
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username, setUsername] = useState('테스트사용자');
  const [serverAddress, setServerAddress] = useState('http://localhost:3000');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const history = useHistory();

  // 테스트용 로그아웃 처리
  const logout = () => {
    history.push('/login');
  };

  // 가상의 소켓 객체 (테스트용)
  const mockSocket = {
    emit: (event, data) => {
      console.log(`Socket 이벤트 ${event} 발생:`, data);
      
      // command-result 이벤트 리스너를 위한 가상 응답
      if (event === 'execute-command') {
        setTimeout(() => {
          if (mockSocket.listeners['command-result']) {
            mockSocket.listeners['command-result'].forEach(callback => {
              callback({ success: true, message: '명령이 성공적으로 전송되었습니다.' });
            });
          }
        }, 1000);
      }
      
      // request-screenshot 이벤트 리스너를 위한 가상 응답
      if (event === 'request-screenshot') {
        setTimeout(() => {
          if (mockSocket.listeners['ai-response']) {
            mockSocket.listeners['ai-response'].forEach(callback => {
              callback({
                image: '', // 실제 이미지는 제공하지 않음
                timestamp: new Date().toISOString()
              });
            }); 
          }
        }, 1000);
      }
    },
    on: (event, callback) => {
      if (!mockSocket.listeners[event]) {
        mockSocket.listeners[event] = [];
      }
      mockSocket.listeners[event].push(callback);
    },
    once: (event, callback) => {
      if (!mockSocket.listeners[event]) {
        mockSocket.listeners[event] = [];
      }
      mockSocket.listeners[event].push(callback);
    },
    off: (event) => {
      mockSocket.listeners[event] = [];
    },
    disconnect: () => {
      console.log('Socket 연결 해제');
    },
    listeners: {}
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      serverAddress,
      socket: mockSocket,
      login: async () => true,
      logout,
      connectionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
