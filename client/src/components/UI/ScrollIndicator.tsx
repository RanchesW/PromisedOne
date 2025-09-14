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
    <div className="fixed right-0 top-0 bottom-0 z-50 w-3 bg-gray-100 border-l border-gray-200">
      {/* Scroll Track */}
      <div className="relative w-full h-full">
        {/* Scroll Thumb */}
        <div 
          className="absolute right-0 w-full bg-gray-400 hover:bg-gray-500 transition-colors cursor-pointer"
          style={{ 
            height: `${Math.max(10, (window.innerHeight / document.documentElement.scrollHeight) * 100)}%`,
            top: `${scrollProgress * (100 - Math.max(10, (window.innerHeight / document.documentElement.scrollHeight) * 100)) / 100}%`
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