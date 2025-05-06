import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ConnectButton = styled.button`
  width: 100%;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #2980b9;
  }
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 20px;
  padding: 10px;
  background-color: #fadbd8;
  border-radius: 4px;
  text-align: center;
`;

const ScanButton = styled.button`
  margin-top: 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #27ae60;
  }
`;

const Instructions = styled.p`
  margin-top: 30px;
  color: #7f8c8d;
  text-align: center;
  font-size: 14px;
  max-width: 400px;
`;

const ConnectionScreen = ({ onConnect, error }) => {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      onConnect(address.trim());
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // 여기에 실제 QR 코드 스캔 코드를 추가해야 합니다.
    // 스캔 기능 구현 시 onConnect(scannedAddress)를 호출하면 됩니다.
    
    // 예시 목적으로 타임아웃 후 스캔 종료
    setTimeout(() => {
      setIsScanning(false);
      alert('QR 코드 스캔 기능이 아직 구현되지 않았습니다');
    }, 2000);
  };

  return (
    <Container>
      <Title>Desktop Controller Remote</Title>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="address">서버 주소</Label>
          <Input
            id="address"
            type="text"
            placeholder="예: 192.168.0.10:3000"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </InputGroup>
        
        <ConnectButton type="submit" disabled={!address.trim()}>
          연결
        </ConnectButton>
        
        <ScanButton type="button" onClick={handleScan} disabled={isScanning}>
          {isScanning ? '스캔 중...' : 'QR 코드 스캔'}
        </ScanButton>
      </Form>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Instructions>
        Desktop Controller 애플리케이션에 표시된 주소를 입력하거나 QR 코드를 스캔하여 연결하세요.
      </Instructions>
    </Container>
  );
};

export default ConnectionScreen;