import React from 'react';
import { IonIcon } from '@ionic/react';
import { sparkles } from 'ionicons/icons';
import './QuickCommands.css';

const QuickCommands = ({ onSelectCommand }) => {
  // 빠른 명령 목록
  const quickCommands = [
    { text: '안녕하세요', icon: sparkles },
    { text: '오늘 날씨 어때?', icon: sparkles },
    { text: '요약해줘', icon: sparkles },
    { text: '이미지 생성해줘', icon: sparkles }
  ];

  return (
    <div className="quick-commands-section">
      <div className="section-header">
        <IonIcon icon={sparkles} />
        <h3>빠른 명령</h3>
      </div>
      <div className="quick-commands-grid">
        {quickCommands.map((cmd, index) => (
          <div 
            key={index} 
            className="quick-command-item"
            onClick={() => onSelectCommand(cmd.text)}
          >
            <div className="quick-command-content">
              <span>{cmd.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickCommands;