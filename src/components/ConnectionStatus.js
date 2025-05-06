import React from 'react';
import { useAuth } from './AuthContext';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { connectionStatus } = useAuth();
  
  return (
    <div className="connection-status">
      <div className={`status-indicator ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`}></div>
      <span>{connectionStatus === 'connected' ? '데스크탑에 연결됨' : '연결 끊김'}</span>
    </div>
  );
};

export default ConnectionStatus;