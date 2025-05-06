import React from 'react';

const ModernRemoteDesktopLogo = (props) => {
  const { width = 24, height = 24, primaryColor = "#2563EB", secondaryColor = "#3B82F6", accentColor = "#60A5FA" } = props;
  
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
      {/* 모니터 베이스 */}
      <rect x="1.5" y="4" width="15" height="11" rx="2" fill={secondaryColor} fillOpacity="0.2" stroke={primaryColor} strokeWidth="1.2" />
      
      {/* 모니터 스크린 */}
      <rect x="2.5" y="5" width="13" height="8" rx="1" fill={primaryColor} fillOpacity="0.1" />
      
      {/* 스크린 내부 UI 요소 */}
      <path d="M4 7h10" stroke={primaryColor} strokeWidth="1" />
      <path d="M4 9h7" stroke={primaryColor} strokeWidth="1" />
      <path d="M4 11h5" stroke={primaryColor} strokeWidth="1" />
      
      {/* 모니터 스탠드 */}
      <path d="M9 15L9 18" stroke={primaryColor} strokeWidth="1.2" />
      <path d="M6 18L12 18" stroke={primaryColor} strokeWidth="1.5" />
      
      {/* 모바일 디바이스 */}
      <rect x="17" y="7" width="5.5" height="9" rx="1.2" fill={secondaryColor} fillOpacity="0.2" stroke={primaryColor} strokeWidth="1.2" />
      <rect x="17.8" y="8" width="4" height="6" rx="0.4" fill={primaryColor} fillOpacity="0.1" />
      <circle cx="19.8" cy="15" r="0.6" fill={accentColor} />
      
      {/* 연결 효과 */}
      <path d="M17 11C15.5 11 13 10.5 13 7" stroke={accentColor} strokeDasharray="0.8 0.8" />
      
      {/* 무선 신호들 */}
      <path d="M11 3.5C12.5 3.5 14 4 14 6" stroke={accentColor} strokeWidth="0.8" />
      <path d="M12 1.5C14 1.5 16 2.5 16 6" stroke={accentColor} strokeWidth="0.8" />
      
      {/* 데이터 전송 표시 */}
      <circle cx="15" cy="6.5" r="0.4" fill={accentColor} />
      <circle cx="16" cy="8.5" r="0.4" fill={accentColor} />
      <circle cx="15" cy="10.5" r="0.4" fill={accentColor} />
    </svg>
  );
};

export default ModernRemoteDesktopLogo;