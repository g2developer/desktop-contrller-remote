import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import ConnectionScreen from './components/ConnectionScreen';
import ControlPanel from './components/ControlPanel';
import './App.css';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  const [connected, setConnected] = useState(false);
  const [serverAddress, setServerAddress] = useState('');
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [screenData, setScreenData] = useState(null);

  // 서버에 연결하는 함수
  const connectToServer = (address) => {
    try {
      // 이전 연결 정리
      if (socket) {
        socket.disconnect();
      }

      // 주소가 http:// 또는 https://로 시작하는지 확인
      let serverUrl = address;
      if (!address.startsWith('http://') && !address.startsWith('https://')) {
        serverUrl = `http://${address}`;
      }

      // Socket.io 연결 시도
      const newSocket = io(serverUrl);
      setSocket(newSocket);
      setServerAddress(serverUrl);
      setError(null);

      // 연결 이벤트 처리
      newSocket.on('connect', () => {
        console.log('서버에 연결됨');
        setConnected(true);
      });

      // 연결 오류 처리
      newSocket.on('connect_error', (err) => {
        console.error('연결 오류:', err);
        setError(`연결 오류: ${err.message}`);
        setConnected(false);
      });

      // 화면 데이터 수신
      newSocket.on('screenUpdate', (data) => {
        setScreenData(data);
      });

      // 연결 종료 처리
      newSocket.on('disconnect', () => {
        console.log('서버와 연결 끊김');
        setConnected(false);
      });

    } catch (err) {
      console.error('연결 시도 중 오류 발생:', err);
      setError(`연결 시도 중 오류 발생: ${err.message}`);
    }
  };

  // 명령 전송 함수
  const sendCommand = (command) => {
    if (socket && connected) {
      socket.emit('command', command);
    }
  };

  // 컴포넌트 언마운트 시 소켓 연결 정리
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <AppContainer>
      {!connected ? (
        <ConnectionScreen 
          onConnect={connectToServer} 
          error={error} 
        />
      ) : (
        <ControlPanel
          sendCommand={sendCommand}
          screenData={screenData}
          onDisconnect={() => {
            if (socket) {
              socket.disconnect();
            }
            setConnected(false);
          }}
          serverAddress={serverAddress}
        />
      )}
    </AppContainer>
  );
}

export default App;