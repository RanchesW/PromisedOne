import React, { useState, useEffect } from 'react';

const ScrollIndicator: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollIndicator(currentScrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = Math.min(100, (scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

  if (!showScrollIndicator) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 w-4" style={{ backgroundColor: '#f1f1f1' }}>
      {/* Scroll Track */}
      <div className="relative w-full h-full">
        {/* Scroll Thumb */}
        <div 
          className="absolute w-full cursor-pointer transition-colors"
          style={{ 
            backgroundColor: '#c1c1c1',
            height: `${Math.max(20, (window.innerHeight / document.documentElement.scrollHeight) * 100)}%`,
            top: `${scrollProgress * (100 - Math.max(20, (window.innerHeight / document.documentElement.scrollHeight) * 100)) / 100}%`,
            borderRadius: '0px'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#a8a8a8';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#c1c1c1';
          }}
          onClick={() => {
            const clickPosition = scrollProgress / 100;
            const targetScrollY = clickPosition * (document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
};

export default ScrollIndicator;