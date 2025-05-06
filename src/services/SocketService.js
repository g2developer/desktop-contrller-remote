import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
    this.connectionState = 'disconnected';
    this.connectionStateListeners = [];
    this.reconnectInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(serverAddress) {
    // 이미 연결이 있다면 먼저 해제
    if (this.socket) {
      this.disconnect();
    }

    try {
      console.log('Connecting to socket server:', serverAddress);
      
      // 소켓 연결 설정 - 입력한 주소 그대로 사용
      this.socket = io(serverAddress, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      // 연결 이벤트
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.updateConnectionState('connected');
        this.reconnectAttempts = 0;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      });

      // 연결 실패 이벤트
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.updateConnectionState('error');
        this.attemptReconnect();
      });

      // 연결 종료 이벤트
      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.updateConnectionState('disconnected');
        
        // 서버 측에서 강제로 연결을 끊은 경우 재연결 시도하지 않음
        if (reason === 'io server disconnect') {
          console.log('Server forced disconnect, not attempting reconnection');
        } else {
          this.attemptReconnect();
        }
      });

      // 서버에서 강제 연결 종료 이벤트 처리
      this.socket.on('force-disconnect', (data) => {
        console.log('Server forced disconnect:', data);
        this.disconnect();
      });

      // 등록된 콜백들 새로운 소켓에 연결
      this.reattachEventListeners();

      return true;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (error) {
        console.error('Error during socket disconnect:', error);
      }
      this.socket = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.updateConnectionState('disconnected');
  }

  attemptReconnect() {
    // 이미 재연결 시도 중이라면 추가로 실행하지 않음
    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
        this.updateConnectionState('failed');
        return;
      }
      
      if (this.socket) {
        try {
          this.socket.connect();
        } catch (error) {
          console.error('Error during reconnect attempt:', error);
        }
      }
    }, 5000); // 5초마다 재연결 시도
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
    
    return this; // 메서드 체이닝을 위해 this 반환
  }

  off(event, callback) {
    if (this.callbacks.has(event)) {
      if (callback) {
        // 특정 콜백만 제거
        const callbacks = this.callbacks.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // 해당 이벤트의 모든 콜백 제거
        this.callbacks.delete(event);
      }
    }

    if (this.socket) {
      try {
        if (callback) {
          this.socket.off(event, callback);
        } else {
          this.socket.off(event);
        }
      } catch (error) {
        console.error(`Error removing event listener for ${event}:`, error);
      }
    }
    
    return this;
  }

  emit(event, data, callback) {
    if (!this.socket || !this.isConnected()) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return false;
    }

    try {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
      return false;
    }
  }

  // 이벤트 리스너 다시 연결
  reattachEventListeners() {
    if (!this.socket) return;
    
    try {
      this.callbacks.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    } catch (error) {
      console.error('Error reattaching event listeners:', error);
    }
  }

  // 연결 상태 변경 및 리스너에게 알림
  updateConnectionState(state) {
    this.connectionState = state;
    
    // 모든 연결 상태 리스너에게 알림
    this.connectionStateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error notifying connection state listener:', error);
      }
    });
  }

  // 연결 상태 리스너 등록
  onConnectionStateChange(listener) {
    if (typeof listener === 'function') {
      this.connectionStateListeners.push(listener);
      
      // 현재 상태 즉시 전달
      try {
        listener(this.connectionState);
      } catch (error) {
        console.error('Error calling connection state listener:', error);
      }
    }
    
    return this;
  }

  // 연결 상태 리스너 제거
  offConnectionStateChange(listener) {
    const index = this.connectionStateListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionStateListeners.splice(index, 1);
    }
    return this;
  }

  // 현재 연결 상태 반환
  getConnectionState() {
    return this.connectionState;
  }

  // 연결 여부 확인
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;