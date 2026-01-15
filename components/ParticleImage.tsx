import React, { useRef, useEffect, useState } from 'react';

interface ParticleImageProps {
  src: string;
  alt: string;
}

const ParticleImage: React.FC<ParticleImageProps> = ({ src, alt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset loaded state when src changes to trigger animation again
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      size: number; 
      life: number; 
      maxLife: number;
    }[] = [];

    const resize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = () => {
        // Spawn primarily at the bottom/center for "rising mist" effect
        const startX = Math.random() * canvas.width;
        const startY = canvas.height * 0.8 + Math.random() * canvas.height * 0.2;

        particles.push({
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 0.5, 
          vy: -(Math.random() * 0.8 + 0.2), // Slow rising
          size: Math.random() * 2 + 0.5,
          life: 0, // Start invisible, fade in then out
          maxLife: Math.random() * 3 + 2 // Longer life
        });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (particles.length < 80) {
        createParticle();
      }

      ctx.globalCompositeOperation = 'screen'; 
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        // Organic sine wave drift
        p.x += Math.sin(Date.now() / 2000 + p.y * 0.01) * 0.1;
        
        // Life cycle handling
        p.life += 0.01;
        
        const fadeOutPoint = p.maxLife * 0.8;
        let alpha = 0;
        if (p.life < 1) alpha = p.life; // Fade in
        else if (p.life > fadeOutPoint) alpha = 1 - (p.life - fadeOutPoint) / (p.maxLife - fadeOutPoint); // Fade out
        else alpha = 1; // Sustain

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Golden/Purple stardust color
        ctx.fillStyle = `rgba(230, 210, 255, ${alpha * 0.5})`;
        ctx.fill();
      }
      
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-square md:h-96 rounded-full flex items-center justify-center mb-8 group select-none">
      <style>{`
        @keyframes ink-bloom {
          0% {
            opacity: 0;
            filter: blur(20px) contrast(2) brightness(0.5);
            transform: scale(0.9);
          }
          50% {
            opacity: 0.8;
            filter: blur(10px) contrast(1.5) brightness(0.8);
          }
          100% {
            opacity: 1;
            filter: blur(0px) contrast(1.1) brightness(1.1);
            transform: scale(1);
          }
        }
        
        .animate-ink-bloom {
          animation: ink-bloom 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* 1. Ambient Background Glow (The Void Bleed) */}
      {/* This layer is heavily blurred and scaled up to create the atmosphere around the image */}
      <div className="absolute inset-0 z-0">
         <img 
            src={src} 
            alt="" 
            className="w-full h-full object-cover rounded-full opacity-40 blur-[60px] scale-125 transition-opacity duration-[3s]"
            style={{ opacity: isLoaded ? 0.4 : 0 }}
         />
      </div>

      {/* 2. Main Image Container */}
      {/* Uses a complex radial mask to feather the edges into the void */}
      <div className="relative z-10 w-full h-full overflow-hidden rounded-full">
        {/* The Mask Layer */}
        <div 
            className="absolute inset-0 w-full h-full"
            style={{
                // Mask: Center is opaque (black), fading to transparent at edges
                maskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 50%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 50%, transparent 75%)'
            }}
        >
             <img 
                src={src} 
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-[20s] ease-in-out transform group-hover:scale-110 ${isLoaded ? 'animate-ink-bloom' : 'opacity-0'}`}
             />
        </div>
      </div>
      
      {/* 3. Particle Canvas Overlay */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-20 w-full h-full rounded-full"
      />
      
      {/* 4. Vignette / Noise Overlay for Texture */}
      <div className="absolute inset-0 pointer-events-none z-30 rounded-full opacity-30 bg-[radial-gradient(circle_at_center,transparent_40%,#0a0c16_100%)]" />
    </div>
  );
};

export default ParticleImage;