import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0c16]">
      {/* Deep space base is handled by bg color */}
      
      {/* Diffuse blobs - Adjusted colors */}
      {/* 1. Deep Blue */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[120px] animate-float opacity-50 mix-blend-screen" />
      
      {/* 2. Mystic Purple */}
      <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[130px] animate-float opacity-40 mix-blend-screen" style={{ animationDelay: '3s' }} />
      
      {/* 3. Aurora Green */}
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-emerald-900/15 rounded-full blur-[140px] animate-float opacity-30 mix-blend-screen" style={{ animationDelay: '6s' }} />
      
      {/* Noise texture overlay for film grain effect */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }} 
      />
    </div>
  );
};

export default Background;
