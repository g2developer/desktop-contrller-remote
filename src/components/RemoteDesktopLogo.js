import React from 'react';

const RemoteDesktopLogo = (props) => {
  const { width = 24, height = 24, primaryColor = "#0284C7", secondaryColor = "#0EA5E9" } = props;
  
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
      {...props}
    >
      {/* 모니터 화면 */}
      <rect x="2" y="3" width="16" height="11" rx="1" fill={secondaryColor} fillOpacity="0.2" stroke={primaryColor} />
      
      {/* 화면 내부 */}
      <rect x="3" y="4" width="14" height="9" rx="0.5" fill={secondaryColor} fillOpacity="0.1" />
      
      {/* 화면 UI 요소들 */}
      <path d="M5 6h10" stroke={primaryColor} strokeWidth="1" />
      <path d="M5 8h8" stroke={primaryColor} strokeWidth="1" />
      <path d="M5 10h6" stroke={primaryColor} strokeWidth="1" />
      
      {/* 스탠드 */}
      <path d="M10 14v2" stroke={primaryColor} />
      <path d="M7 16h6" stroke={primaryColor} strokeWidth="1.5" />
      
      {/* 모바일 디바이스 */}
      <rect x="18" y="8" width="4" height="7" rx="0.5" fill={secondaryColor} fillOpacity="0.2" stroke={primaryColor} />
      <rect x="18.5" y="9" width="3" height="5" rx="0.25" fill={secondaryColor} fillOpacity="0.1" />
      <circle cx="20" cy="14" r="0.3" fill={primaryColor} />
      
      {/* 연결 선 */}
      <path d="M18 11C16 11 14 10 14 7" stroke={primaryColor} strokeDasharray="0.5 0.5" />
      
      {/* 무선 신호 */}
      <path d="M15 5.5c1 0 1.5 0.5 1.5 1.5" stroke={primaryColor} strokeWidth="0.75" />
      <path d="M15 4c1.5 0 2.5 1 2.5 3" stroke={primaryColor} strokeWidth="0.75" />
      <path d="M15 2.5c2 0 3.5 1.5 3.5 4.5" stroke={primaryColor} strokeWidth="0.75" />
    </svg>
  );
};

export default RemoteDesktopLogo;