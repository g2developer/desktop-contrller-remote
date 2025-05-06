import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setupIonicReact } from '@ionic/react';

// Ionic 설정 (iOS 모드로 설정)
setupIonicReact({
  mode: 'ios'  // iOS 스타일로 설정
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);