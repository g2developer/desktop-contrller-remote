import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
    this.connectionState = 'disconnected';
    this.connectionStateListeners = [];
    this.reconnectInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 15; // 재연결 시도 횟수 더 증가
  }

  connect(serverAddress) {
    // 이미 연결이 있다면 먼저 해제
    if (this.socket) {
      this.disconnect();
    }

    try {
      console.log('Connecting to socket server:', serverAddress);
      
      // 소켓 연결 설정 - 입력한 주소 그대로 사용
      console.log('소켓 연결 시도하는 서버 주소:', serverAddress);
      
      try {
        // 테스트용 소켓 설정 출력
        console.log('소켓 설정: 모든 전송 방식 활성화');
        
        // Socket.IO 기본 URL 경로를 사용하며, 양쪽 전송 옵션을 모두 활성화
        this.socket = io(serverAddress, {
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 60000, // 타임아웃 값 60초(1분)로 증가
          transports: ['polling', 'websocket'], // polling을 먼저 시도하고 websocket으로 업그레이드
          upgrade: true,
          forceNew: true,
          autoConnect: true,
          extraHeaders: {  // 추가 헤더 설정(캩0시 방지)
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (e) {
        console.error('소켓 오브젝트 생성 중 오류:', e);
        throw e;
      }

      // 연결 이벤트
      this.socket.on('connect', () => {
        console.log('Socket connected successfully! Socket ID:', this.socket.id);
        this.updateConnectionState('connected');
        this.reconnectAttempts = 0;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        
        // 연결 후 자동으로 클라이언트 정보 전송
        try {
          console.log('클라이언트 정보 자동 전송...');
          this.socket.emit('client-info', {
            device: navigator.userAgent || '알 수 없음',
            type: 'mobile',
            platform: navigator.platform || '알 수 없음',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('클라이언트 정보 전송 중 오류:', error);
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

    console.log('재연결 시도 시작...');
    this.updateConnectionState('reconnecting');
    
    this.reconnectInterval = setInterval(() => {
      this.reconnectAttempts++;
      console.log(`재연결 시도 중 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.log('최대 재연결 시도 횟수 도달');
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
        this.updateConnectionState('failed');
        return;
      }
      
      if (this.socket) {
        try {
          console.log('소켓 재연결 시도...', this.socket.io?.uri || '알 수 없음');
          this.socket.connect();
          
          // 연결 상태 확인
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              console.log('재연결 성공!');
              clearInterval(this.reconnectInterval);
              this.reconnectInterval = null;
              this.reconnectAttempts = 0;
              this.updateConnectionState('connected');
            }
          }, 1000);
        } catch (error) {
          console.error('재연결 시도 중 오류:', error);
        }
      }
    }, 3000); // 3초마다 재연결 시도(주기 단축)
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
    if (!this.socket) {
      console.warn('소켓이 없습니다. 이벤트를 발생할 수 없습니다:', event);
      return false;
    }

    if (!this.isConnected()) {
      console.warn('소켓이 연결되지 않았습니다. 이벤트를 발생할 수 없습니다:', event);
      // 연결되지 않은 상태에서 자동 재연결 시도
      if (event === 'login') {
        console.log('로그인 이벤트 발생 시도 중 연결되지 않음, 재연결 시도 중...');
        setTimeout(() => this.attemptReconnect(), 500);
      }
      return false;
    }

    try {
      console.log(`이벤트 발생: ${event}`, {
        hasCallback: !!callback, 
        data: event === 'login' ? { id: data.id, hasPassword: !!data.password } : data 
      });
      
      if (callback) {
        this.socket.emit(event, data, (response) => {
          console.log(`이벤트 ${event} 응답 받음:`, response);
          callback(response);
        });
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error(`이벤트 ${event} 발생 중 오류:`, error);
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

  // 연결 여부 확인 - 더 안정적인 방법으로 개선
  isConnected() {
    try {
      if (!this.socket) {
        console.log('연결 확인: 소켓 객체가 없습니다');
        return false;
      }
      
      // connected 상태를 직접 확인
      const isActive = this.socket.connected;
      console.log(`연결 확인: ${isActive ? '연결됨' : '연결되지 않음'} (socket.id: ${this.socket.id || '없음'})`);
      return isActive;
    } catch (error) {
      console.error('연결 상태 확인 오류:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;