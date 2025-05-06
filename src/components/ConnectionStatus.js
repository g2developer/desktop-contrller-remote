import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/SocketService';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { connectionStatus } = useAuth();
  const [statusText, setStatusText] = useState('연결 확인 중');
  const [statusClass, setStatusClass] = useState('checking');
  
  useEffect(() => {
    // 소켓 연결 상태에 따라 텍스트와 클래스 업데이트
    switch (connectionStatus) {
      case 'connected':
        setStatusText('데스크탑에 연결됨');
        setStatusClass('connected');
        break;
      case 'disconnected':
        setStatusText('연결 끊김');
        setStatusClass('disconnected');
        break;
      case 'error':
        setStatusText('연결 오류');
        setStatusClass('error');
        break;
      case 'failed':
        setStatusText('연결 실패');
        setStatusClass('error');
        break;
      default:
        setStatusText('연결 확인 중');
        setStatusClass('checking');
    }
  }, [connectionStatus]);
  
  return (
    <div className={`connection-status ${statusClass}`}>
      <div className={`status-indicator ${statusClass}`}></div>
      <span>{statusText}</span>
    </div>
  );
};

export default ConnectionStatus;