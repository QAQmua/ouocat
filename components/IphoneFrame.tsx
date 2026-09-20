import React, { ReactNode } from 'react';

interface IphoneFrameProps {
  children: ReactNode;
  onGoHome: () => void;
  isAiThinking?: boolean;
  isDarkMode?: boolean;
}

const IphoneFrame: React.FC<IphoneFrameProps> = ({ children, onGoHome, isDarkMode }) => {
  return (
    <div className={`relative mx-auto ${isDarkMode ? 'border-[#262626] bg-[#0a0a0a]' : 'border-[#d1d5db] bg-[#f9fafb]'} border-[8px] rounded-[3.5rem] h-[740px] w-[390px] shadow-[0_20px_100px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500`}>
      {/* Precision Frame Accents */}
      <div className={`absolute inset-0 border-[1px] ${isDarkMode ? 'border-white/5' : 'border-white/50'} rounded-[3rem] pointer-events-none z-50`}></div>

      <div className={`relative rounded-[3rem] overflow-hidden w-full h-full ${isDarkMode ? 'bg-black' : 'bg-white'} transition-colors duration-500`}>
        {children}
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center z-50">
          <div 
            className={`w-32 h-1.5 ${isDarkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'} rounded-full cursor-pointer transition-colors backdrop-blur-md`}
            onClick={onGoHome}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default IphoneFrame;
