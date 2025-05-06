import React, { createContext, useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import authService from '../services/AuthService';
import socketService from '../services/SocketService';

// 인증 컨텍스트 생성
const AuthContext = createContext({
  isAuthenticated: false,
  username: '',
  serverAddress: '',
  socket: null,
  login: async () => ({ success: false }),
  logout: () => {},
  connectionStatus: 'disconnected'
});

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  // 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isInitialized, setIsInitialized] = useState(false);
  const history = useHistory();

  // 앱 시작 시 자동 로그인 시도
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await authService.autoLogin();
        
        if (result.success) {
          // 인증 성공
          const { userData, serverAddress } = authService.getAuthStatus();
          setIsAuthenticated(true);
          setUsername(userData.username);
          setServerAddress(serverAddress);
          
          // 화면이 준비되면 메인 페이지로 이동
          if (history) {
            history.replace('/main');
          }
        } else {
          // 인증 실패 - 로그인 화면으로
          setIsAuthenticated(false);
          if (history) {
            history.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auto login error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    // history 객체가 준비되었을 때만 초기화 수행
    if (history) {
      initAuth();
    } else {
      setIsInitialized(true);
    }
  }, [history]);

  // 연결 상태 리스너 등록
  useEffect(() => {
    const handleConnectionChange = (state) => {
      setConnectionStatus(state);
    };

    socketService.onConnectionStateChange(handleConnectionChange);

    return () => {
      socketService.offConnectionStateChange(handleConnectionChange);
    };
  }, []);

  // 로그인 함수
  const login = async (serverAddr, user, password) => {
    const result = await authService.login(serverAddr, user, password);
    
    if (result.success) {
      const { userData, serverAddress } = authService.getAuthStatus();
      setIsAuthenticated(true);
      setUsername(userData.username);
      setServerAddress(serverAddress);
    }
    
    return result;
  };

  // 로그아웃 함수
  const logout = async () => {
    const result = await authService.logout();
    
    if (result.success) {
      setIsAuthenticated(false);
      setUsername('');
      setServerAddress('');
      if (history) {
        history.push('/login');
      }
    }
    
    return result;
  };

  // 앱이 초기화되지 않았다면 로딩 상태 표시
  if (!isInitialized) {
    return null; // 또는 로딩 컴포넌트
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      serverAddress,
      socket: socketService.socket,
      login,
      logout,
      connectionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
