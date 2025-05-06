import React from 'react';

const DesktopLogo = (props) => {
  const { width = 24, height = 24, color = "#007AFF", secondaryColor = "#4F46E5" } = props;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* 모니터 화면 */}
      <rect x="2" y="3" width="20" height="14" rx="2" fill="white" stroke={color} />
      
      {/* 화면 내부 */}
      <rect x="4" y="5" width="16" height="10" rx="1" fill={secondaryColor} opacity="0.2" />
      
      {/* 화면 UI 요소들 */}
      <path d="M6 7h12" stroke={color} strokeWidth="1" />
      <path d="M6 9h8" stroke={color} strokeWidth="1" />
      <path d="M6 11h10" stroke={color} strokeWidth="1" />
      <path d="M6 13h6" stroke={color} strokeWidth="1" />
      
      {/* 스탠드 */}
      <path d="M9 17L9 20" stroke={color} />
      <path d="M15 17L15 20" stroke={color} />
      <path d="M8 20H16" stroke={color} strokeWidth="2" />
      
      {/* 연결 선 */}
      <path d="M20 10C20.5 10 22 11 22 13" stroke={color} strokeDasharray="1 1" />
    </svg>
  );
};

export default DesktopLogo;