import React from 'react';

const AILogo = (props) => {
  const { width = 24, height = 24, color = "#007AFF" } = props;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color}
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* 모던한 AI 로고 디자인 */}
      <circle cx="12" cy="12" r="10" stroke={color} fill="none" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      
      {/* AI 텍스트 */}
      <path d="M7 9v6" />
      <path d="M5 9h4" />
      <path d="M5 12h4" />
      <path d="M13 9v6" />
      <path d="M13 9h3a2 2 0 1 1 0 3h-3 M16 15h-3" />
      
      {/* 데이터 흐름 효과 */}
      <path d="M4 17L7 14" strokeDasharray="1 2" />
      <path d="M17 7L20 4" strokeDasharray="1 2" />
    </svg>
  );
};

export default AILogo;