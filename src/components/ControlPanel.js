import React, { useState } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #2c3e50;
  padding: 15px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
`;

const DisconnectButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const ScreenArea = styled.div`
  flex: 1;
  background-color: #ecf0f1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const ScreenPlaceholder = styled.div`
  background-color: #34495e;
  width: 80%;
  height: 60%;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #bdc3c7;
  text-align: center;
  padding: 20px;
`;

const ControlsArea = styled.div`
  padding: 15px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
`;

const ControlButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  touch-action: manipulation;
  
  &:active {
    background-color: #2980b9;
    transform: scale(0.98);
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ButtonIcon = styled.span`
  font-size: 24px;
  margin-bottom: 5px;
`;

const KeyboardToggle = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  font-size: 16px;
  margin-top: 10px;
  cursor: pointer;
  
  &:active {
    background-color: #27ae60;
  }
`;

const VirtualKeyboard = styled.div`
  display: ${props => props.visible ? 'grid' : 'none'};
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  margin-top: 15px;
  padding: 10px;
  background-color: #ecf0f1;
  border-radius: 8px;
`;

const KeyboardKey = styled.button`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 5px;
  font-size: 14px;
  cursor: pointer;
  touch-action: manipulation;
  
  &:active {
    background-color: #f0f0f0;
    transform: scale(0.95);
  }
`;

// 특수 키 (더 넓은 width)
const SpecialKey = styled(KeyboardKey)`
  grid-column: span ${props => props.span || 1};
`;

// 슬라이더 컴포넌트
const Slider = styled.input`
  width: 100%;
  margin: 20px 0;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
  color: #7f8c8d;
`;

const TabButton = styled.button`
  background-color: ${props => props.active ? '#3498db' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  border: 1px solid #ddd;
  border-bottom: ${props => props.active ? 'none' : '1px solid #ddd'};
  border-radius: 4px 4px 0 0;
  padding: 10px 15px;
  cursor: pointer;
  outline: none;
  margin-right: 5px;
  
  &:hover {
    background-color: ${props => props.active ? '#3498db' : '#e9ecef'};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
`;

// ControlPanel 컴포넌트
const ControlPanel = ({ sendCommand, screenData, onDisconnect, serverAddress }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'media', 'system'
  
  // 명령 처리 함수
  const handleCommand = (command) => {
    sendCommand({ type: command, timestamp: Date.now() });
  };
  
  // 미디어 컨트롤 명령
  const handleMediaCommand = (command) => {
    sendCommand({ type: 'media', action: command, timestamp: Date.now() });
  };
  
  // 시스템 명령
  const handleSystemCommand = (command) => {
    sendCommand({ type: 'system', action: command, timestamp: Date.now() });
  };
  
  // 키보드 키 입력 처리
  const handleKeyPress = (key) => {
    sendCommand({ type: 'keypress', key, timestamp: Date.now() });
  };
  
  // 마우스 움직임 처리 (실제 구현 필요)
  const handleMouseMove = (e) => {
    // 여기에 마우스 이동 로직 구현
  };
  
  // 터치 처리 (실제 구현 필요)
  const handleTouch = (e) => {
    // 여기에 터치 이벤트 로직 구현
  };
  
  return (
    <Container>
      <Header>
        <Title>Desktop Controller Remote</Title>
        <DisconnectButton onClick={onDisconnect}>연결 해제</DisconnectButton>
      </Header>
      
      <ScreenArea
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouch}
      >
        {screenData ? (
          <img 
            src={`data:image/jpeg;base64,${screenData}`} 
            alt="Remote Screen" 
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <ScreenPlaceholder>
            화면 데이터를 기다리는 중입니다...
          </ScreenPlaceholder>
        )}
      </ScreenArea>
      
      <ControlsArea>
        <TabsContainer>
          <TabButton 
            active={activeTab === 'basic'}
            onClick={() => setActiveTab('basic')}
          >
            기본 제어
          </TabButton>
          <TabButton 
            active={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
          >
            미디어
          </TabButton>
          <TabButton 
            active={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
          >
            시스템
          </TabButton>
        </TabsContainer>
        
        {activeTab === 'basic' && (
          <>
            <ButtonGrid>
              <ControlButton onClick={() => handleCommand('left_click')}>
                <ButtonIcon>👆</ButtonIcon>
                좌클릭
              </ControlButton>
              <ControlButton onClick={() => handleCommand('right_click')}>
                <ButtonIcon>👉</ButtonIcon>
                우클릭
              </ControlButton>
              <ControlButton onClick={() => handleCommand('double_click')}>
                <ButtonIcon>👆👆</ButtonIcon>
                더블클릭
              </ControlButton>
              
              <ControlButton onClick={() => handleCommand('scroll_up')}>
                <ButtonIcon>⬆️</ButtonIcon>
                스크롤 위
              </ControlButton>
              <ControlButton onClick={() => handleCommand('scroll_down')}>
                <ButtonIcon>⬇️</ButtonIcon>
                스크롤 아래
              </ControlButton>
              <ControlButton onClick={() => handleCommand('drag')}>
                <ButtonIcon>✋</ButtonIcon>
                드래그
              </ControlButton>
            </ButtonGrid>
            
            <SliderLabel>
              <span>느림</span>
              <span>마우스 속도</span>
              <span>빠름</span>
            </SliderLabel>
            <Slider 
              type="range" 
              min="1" 
              max="10" 
              defaultValue="5"
              onChange={(e) => sendCommand({ 
                type: 'mouse_speed', 
                value: parseInt(e.target.value),
                timestamp: Date.now()
              })}
            />
            
            <KeyboardToggle onClick={() => setKeyboardVisible(!keyboardVisible)}>
              {keyboardVisible ? '키보드 숨기기' : '가상 키보드 보기'}
            </KeyboardToggle>
            
            {keyboardVisible && (
              <VirtualKeyboard visible={keyboardVisible}>
                {/* 첫 번째 행 - 숫자 키 */}
                <KeyboardKey onClick={() => handleKeyPress('`')}>` ~</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('1')}>1 !</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('2')}>2 @</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('3')}>3 #</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('4')}>4 $</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('5')}>5 %</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('6')}>6 ^</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('7')}>7 &</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('8')}>8 *</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('9')}>9 (</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('0')}>0 )</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('-')}>- _</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('=')}>= +</KeyboardKey>
                <SpecialKey onClick={() => handleKeyPress('Backspace')} span={2}>Backspace</SpecialKey>
                
                {/* 두 번째 행 - 상단 행 */}
                <SpecialKey onClick={() => handleKeyPress('Tab')} span={1.5}>Tab</SpecialKey>
                <KeyboardKey onClick={() => handleKeyPress('q')}>Q</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('w')}>W</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('e')}>E</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('r')}>R</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('t')}>T</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('y')}>Y</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('u')}>U</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('i')}>I</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('o')}>O</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('p')}>P</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('[')}>[ {}</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress(']')}>] }</KeyboardKey>
                <SpecialKey onClick={() => handleKeyPress('\\')} span={1.5}>\ |</SpecialKey>
                
                {/* 세 번째 행 - 홈 행 */}
                <SpecialKey onClick={() => handleKeyPress('CapsLock')} span={2}>Caps</SpecialKey>
                <KeyboardKey onClick={() => handleKeyPress('a')}>A</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('s')}>S</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('d')}>D</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('f')}>F</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('g')}>G</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('h')}>H</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('j')}>J</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('k')}>K</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('l')}>L</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress(';')}>; :</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress("'")}>' "</KeyboardKey>
                <SpecialKey onClick={() => handleKeyPress('Enter')} span={2}>Enter</SpecialKey>
                
                {/* 네 번째 행 - 하단 행 */}
                <SpecialKey onClick={() => handleKeyPress('Shift')} span={2.5}>Shift</SpecialKey>
                <KeyboardKey onClick={() => handleKeyPress('z')}>Z</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('x')}>X</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('c')}>C</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('v')}>V</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('b')}>B</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('n')}>N</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('m')}>M</KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress(',')}, ></KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('.')}>. ></KeyboardKey>
                <KeyboardKey onClick={() => handleKeyPress('/')}>/</KeyboardKey>
                <SpecialKey onClick={() => handleKeyPress('Shift')} span={2.5}>Shift</SpecialKey>
                
                {/* 다섯 번째 행 - 스페이스바 */}
                <SpecialKey onClick={() => handleKeyPress('Control')} span={1.5}>Ctrl</SpecialKey>
                <SpecialKey onClick={() => handleKeyPress('Alt')} span={1.5}>Alt</SpecialKey>
                <SpecialKey onClick={() => handleKeyPress(' ')} span={6}>Space</SpecialKey>
                <SpecialKey onClick={() => handleKeyPress('Alt')} span={1.5}>Alt</SpecialKey>
                <SpecialKey onClick={() => handleKeyPress('Control')} span={1.5}>Ctrl</SpecialKey>
              </VirtualKeyboard>
            )}
          </>
        )}
        
        {activeTab === 'media' && (
          <ButtonGrid>
            <ControlButton onClick={() => handleMediaCommand('prev')}>
              <ButtonIcon>⏮️</ButtonIcon>
              이전
            </ControlButton>
            <ControlButton onClick={() => handleMediaCommand('play_pause')}>
              <ButtonIcon>⏯️</ButtonIcon>
              재생/일시정지
            </ControlButton>
            <ControlButton onClick={() => handleMediaCommand('next')}>
              <ButtonIcon>⏭️</ButtonIcon>
              다음
            </ControlButton>
            
            <ControlButton onClick={() => handleMediaCommand('volume_down')}>
              <ButtonIcon>🔉</ButtonIcon>
              볼륨 -
            </ControlButton>
            <ControlButton onClick={() => handleMediaCommand('volume_up')}>
              <ButtonIcon>🔊</ButtonIcon>
              볼륨 +
            </ControlButton>
            <ControlButton onClick={() => handleMediaCommand('mute')}>
              <ButtonIcon>🔇</ButtonIcon>
              음소거
            </ControlButton>
          </ButtonGrid>
        )}
        
        {activeTab === 'system' && (
          <ButtonGrid>
            <ControlButton onClick={() => handleSystemCommand('lock')}>
              <ButtonIcon>🔒</ButtonIcon>
              화면 잠금
            </ControlButton>
            <ControlButton onClick={() => handleSystemCommand('sleep')}>
              <ButtonIcon>💤</ButtonIcon>
              절전 모드
            </ControlButton>
            <ControlButton onClick={() => handleSystemCommand('screenshot')}>
              <ButtonIcon>📸</ButtonIcon>
              스크린샷
            </ControlButton>
            
            <ControlButton onClick={() => handleSystemCommand('brightness_down')}>
              <ButtonIcon>🔅</ButtonIcon>
              밝기 -
            </ControlButton>
            <ControlButton onClick={() => handleSystemCommand('brightness_up')}>
              <ButtonIcon>🔆</ButtonIcon>
              밝기 +
            </ControlButton>
            <ControlButton onClick={() => handleSystemCommand('power')}>
              <ButtonIcon>⏻</ButtonIcon>
              전원
            </ControlButton>
          </ButtonGrid>
        )}
      </ControlsArea>
    </Container>
  );
};

export default ControlPanel;