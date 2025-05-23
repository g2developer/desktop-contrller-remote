import { Preferences } from '@capacitor/preferences';
import socketService from './SocketService';

// 키 상수
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SERVER_ADDRESS: 'server_address'
};

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.userData = null;
    this.serverAddress = null;
    this.authListeners = [];
  }

  /**
   * 서버에 로그인 요청
   * @param {string} serverAddress 서버 주소
   * @param {string} username 사용자명
   * @param {string} password 비밀번호
   * @returns {Promise<Object>} 로그인 결과
   */
  async login(serverAddress, username, password) {
    console.log(`로그인 시도 - 서버: ${serverAddress}, 사용자: ${username}`);
    try {
      // 먼저 서버 주소 포맷 확인 및 수정
      // IP:포트 형식이 아니면 오류 발생
      if (!serverAddress.includes(':')) {
        return { 
          success: false, 
          message: '서버 주소는 IP:포트 형식으로 입력해주세요. (예: 192.168.0.2:6000)' 
        };
      }

      // 프로토콜 처리
      // - Socket.IO는 프로토콜 없이 연결 시도 시 자동으로 ws:// 프로토콜 사용
      // - http:// 또는 https:// 프리픽스가 있으면 제거
      let processedAddress = serverAddress;
      if (processedAddress.startsWith('http://')) {
        processedAddress = processedAddress.replace('http://', '');
      } else if (processedAddress.startsWith('https://')) {
        processedAddress = processedAddress.replace('https://', '');
      } else if (processedAddress.startsWith('ws://')) {
        processedAddress = processedAddress.replace('ws://', '');
      } else if (processedAddress.startsWith('wss://')) {
        processedAddress = processedAddress.replace('wss://', '');
      }
      
      // 특수 문자 제거 및 IP:포트 형식으로 정리
      processedAddress = processedAddress.trim();
      
      console.log('전처리 후 서버 주소:', processedAddress);
      console.log('연결 시도할 주소:', processedAddress);

      // 소켓 연결 시도
      console.log(`소켓 연결 시도: ${processedAddress}`);
      const connected = socketService.connect(processedAddress);
      if (!connected) {
        console.error(`서버 연결 실패: ${processedAddress}`);
        return { success: false, message: `서버에 연결할 수 없습니다: ${processedAddress}` };
      }
      
      // 연결 확인을 위해 소켓 상태 체크
      let connectionCheckAttempts = 0;
      while (!socketService.isConnected() && connectionCheckAttempts < 10) {
        console.log(`연결 상태 확인 중... 시도 ${connectionCheckAttempts + 1}/10`);
        await new Promise(resolve => setTimeout(resolve, 500));
        connectionCheckAttempts++;
      }
      
      if (!socketService.isConnected()) {
        console.error('소켓 연결 실패: 연결 상태 확인 시간 초과');
        return { success: false, message: `서버 연결은 성공했으나 연결 상태 확인에 실패했습니다: ${processedAddress}` };
      }
      
      console.log('소켓 연결 성공, 인증 요청 준비 중...');
      
      // 서버 연결 후 로그인 전 초기화 대기 시간 증가
      console.log('서버 연결 후 로그인 전 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기로 증가

      // 인증 요청 (promise로 변환)
      return new Promise((resolve) => {
        // 요청 타임아웃을 위한 타이머
        const timeoutId = setTimeout(() => {
          console.log('인증 요청 타임아웃 발생');
          if (!this.isAuthenticated) {
            socketService.disconnect();
            resolve({ success: false, message: '인증 요청 시간이 초과되었습니다. 네트워크 상태와 서버 실행 여부를 확인해주세요.' });
          }
        }, 45000); // 45초로 타임아웃 더 증가

        // 인증 요청 전 로그 추가
        console.log(`로그인 요청 전송: ${username}`);
        
        // 인증 요청 - 서버에서 'login' 이벤트를 사용하므로 변경
        socketService.emit('login', { id: username, password }, async (response) => {
          console.log('로그인 응답 수신:', response ? `success=${response.success}` : '응답 없음');
          console.log('로그인 응답 수신:', response);
          // 타임아웃 타이머 해제
          clearTimeout(timeoutId);
          
          if (response && response.success) {
            // 인증 성공 시 정보 저장
            this.isAuthenticated = true;
            this.userData = { 
              username: response.username || username, 
              userId: username  // 서버가 id를 반환하지 않으므로 username을 대신 사용
            };
            this.serverAddress = serverAddress;

            // 로컬 스토리지에 저장 - timestamp를 토큰으로 사용
            const token = response.timestamp || new Date().toISOString();
            await this.saveAuthData(token, this.userData, serverAddress);

            // 리스너에게 알림
            this.notifyListeners(true);

            resolve({ success: true, user: { username } });
          } else {
            // 인증 실패
            socketService.disconnect();
            resolve({ 
              success: false, 
              message: response?.message || '인증에 실패했습니다.' 
            });
          }
        });

        // 테스트 모드 - 서버 응답이 없을 경우 가상 인증 처리
        // 실제 환경에서는 제거하거나 주석 처리해야 합니다
        if (process.env.NODE_ENV === 'development' && serverAddress.includes('localhost')) {
          setTimeout(() => {
            if (!this.isAuthenticated) {
              clearTimeout(timeoutId); // 타임아웃 타이머 해제
              
              // 개발 환경에서의 가상 인증 처리
              this.isAuthenticated = true;
              this.userData = { username, userId: username };
              this.serverAddress = serverAddress;
              
              // 로컬 스토리지에 저장
              this.saveAuthData('dev-token', this.userData, serverAddress);
              
              // 리스너에게 알림
              this.notifyListeners(true);
              
              resolve({ success: true, user: { username } });
            }
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 로그아웃 처리
   */
  async logout() {
    try {
      // 소켓 연결 종료
      try {
        if (socketService.isConnected()) {
          // 서버에는 logout 이벤트가 없어 보입니다. disconnect만 수행
          socketService.disconnect();
        }
      } catch (e) {
        console.error('Error during logout:', e);
      }

      // 인증 상태 초기화
      this.isAuthenticated = false;
      this.userData = null;
      this.serverAddress = null;

      // 로컬 스토리지 데이터 삭제
      await this.clearAuthData();

      // 리스너에게 알림
      this.notifyListeners(false);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // 오류가 있더라도 로컬 상태는 로그아웃 상태로 변경
      this.isAuthenticated = false;
      this.userData = null;
      this.serverAddress = null;
      
      // 강제로 저장소 데이터 삭제 시도
      try {
        await this.clearAuthData();
      } catch (e) {
        console.error('Error clearing auth data during logout:', e);
      }
      
      // 리스너에게 알림
      this.notifyListeners(false);
      
      return { success: true, message: '일부 오류가 있었지만 로그아웃되었습니다.' };
    }
  }

  /**
   * 앱 시작 시 자동 로그인 시도
   */
  async autoLogin() {
    try {
      // 저장된 인증 데이터 로드
      const { token, userData, serverAddress } = await this.loadAuthData();
      
      if (!token || !userData || !serverAddress) {
        return { success: false, message: '저장된 인증 정보가 없습니다.' };
      }

      // 개발 환경에서는 자동 인증 성공 처리 (테스트용)
      if (process.env.NODE_ENV === 'development') {
        this.isAuthenticated = true;
        this.userData = userData;
        this.serverAddress = serverAddress;
        this.notifyListeners(true);
        return { success: true, user: userData };
      }

      // 소켓 연결
      const connected = socketService.connect(serverAddress);
      if (!connected) {
        return { success: false, message: '서버에 연결할 수 없습니다.' };
      }

      // 서버에 토큰 검증 이벤트가 없으므로 ping 이벤트를 사용하여 연결 확인
      return new Promise((resolve) => {
        // 타임아웃 처리
        const timeoutId = setTimeout(() => {
          socketService.disconnect();
          resolve({ success: false, message: '서버 응답 시간이 초과되었습니다.' });
        }, 5000);

        // 연결 상태 확인
        socketService.emit('ping', (response) => {
          clearTimeout(timeoutId);
          
          if (response && response.status === 'ok') {
            // 연결 성공 - ID/비밀번호를 다시 입력해야 합니다
            socketService.disconnect();
            resolve({ 
              success: false, 
              message: '세션이 만료되었습니다. 다시 로그인해주세요.' 
            });
          } else {
            // 연결 실패
            socketService.disconnect();
            resolve({ 
              success: false, 
              message: '서버에 연결할 수 없습니다.' 
            });
          }
        });

        // 테스트 모드 - 서버 응답이 없을 경우 가상 인증 처리
        if (process.env.NODE_ENV === 'development' && serverAddress.includes('localhost')) {
          setTimeout(() => {
            clearTimeout(timeoutId);
            
            // 개발 환경에서의 가상 인증 처리
            this.isAuthenticated = true;
            this.userData = userData;
            this.serverAddress = serverAddress;
            
            // 리스너에게 알림
            this.notifyListeners(true);
            
            resolve({ success: true, user: userData });
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Auto login error:', error);
      return { success: false, message: '자동 로그인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 인증 데이터를 로컬 스토리지에 저장
   */
  async saveAuthData(token, userData, serverAddress) {
    try {
      await Preferences.set({
        key: STORAGE_KEYS.AUTH_TOKEN,
        value: token
      });
      
      await Preferences.set({
        key: STORAGE_KEYS.USER_INFO,
        value: JSON.stringify(userData)
      });
      
      await Preferences.set({
        key: STORAGE_KEYS.SERVER_ADDRESS,
        value: serverAddress
      });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  /**
   * 로컬 스토리지에서 인증 데이터 로드
   */
  async loadAuthData() {
    try {
      const { value: token } = await Preferences.get({ key: STORAGE_KEYS.AUTH_TOKEN });
      const { value: userDataStr } = await Preferences.get({ key: STORAGE_KEYS.USER_INFO });
      const { value: serverAddress } = await Preferences.get({ key: STORAGE_KEYS.SERVER_ADDRESS });
      
      let userData = null;
      
      try {
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      return { token, userData, serverAddress };
    } catch (error) {
      console.error('Error loading auth data:', error);
      return { token: null, userData: null, serverAddress: null };
    }
  }

  /**
   * 로컬 스토리지에서 인증 데이터 삭제
   */
  async clearAuthData() {
    try {
      await Preferences.remove({ key: STORAGE_KEYS.AUTH_TOKEN });
      await Preferences.remove({ key: STORAGE_KEYS.USER_INFO });
      await Preferences.remove({ key: STORAGE_KEYS.SERVER_ADDRESS });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * 인증 상태 변경 리스너 등록
   */
  addAuthListener(listener) {
    if (typeof listener === 'function') {
      this.authListeners.push(listener);
      // 현재 상태 즉시 알림
      try {
        listener(this.isAuthenticated, this.userData);
      } catch (error) {
        console.error('Error calling auth listener:', error);
      }
    }
  }

  /**
   * 인증 상태 변경 리스너 제거
   */
  removeAuthListener(listener) {
    const index = this.authListeners.indexOf(listener);
    if (index !== -1) {
      this.authListeners.splice(index, 1);
    }
  }

  /**
   * 모든 리스너에게 인증 상태 변경 알림
   */
  notifyListeners(isAuthenticated) {
    this.authListeners.forEach(listener => {
      try {
        listener(isAuthenticated, this.userData);
      } catch (error) {
        console.error('Error notifying auth listener:', error);
      }
    });
  }

  /**
   * 현재 인증 상태 반환
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      userData: this.userData,
      serverAddress: this.serverAddress
    };
  }
}

// 싱글톤 인스턴스
const authService = new AuthService();

export default authService;