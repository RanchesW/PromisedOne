import React, { useState, useEffect } from 'react';

interface DiceLoadingProps {
  message?: string;
  duration?: number; // How long to show the loading screen
  onComplete?: () => void;
}

const DiceLoading: React.FC<DiceLoadingProps> = ({ 
  message = "Loading...", 
  duration = 2000,
  onComplete 
}) => {
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(true);
  const [finalResult, setFinalResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  console.log('DiceLoading rendered with:', { message, duration }); // Debug log

  useEffect(() => {
    let rollInterval: NodeJS.Timeout;
    let resultTimeout: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;

    // Roll the dice animation
    rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 20) + 1);
    }, 100);

    // Stop rolling and show final result
    resultTimeout = setTimeout(() => {
      clearInterval(rollInterval);
      const final = Math.floor(Math.random() * 20) + 1;
      setFinalResult(final);
      setDiceValue(final);
      setIsRolling(false);
      setShowResult(true);
    }, duration * 0.7); // 70% of duration for rolling

    // Complete the loading
    completeTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(resultTimeout);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  const getResultText = () => {
    if (!finalResult) return '';
    if (finalResult === 20) return 'Critical Success!';
    if (finalResult === 1) return 'Critical Failure!';
    return `Rolled ${finalResult}`;
  };

  const getResultColor = () => {
    if (!finalResult) return 'text-white';
    if (finalResult === 20) return 'text-yellow-400';
    if (finalResult === 1) return 'text-red-400';
    return 'text-blue-400';
  };

  const getDiceClass = () => {
    let baseClass = "transition-all duration-200 transform";
    
    if (isRolling) {
      return `${baseClass} animate-spin scale-110 text-slate-400`;
    }
    
    if (finalResult === 20) {
      return `${baseClass} text-yellow-400 animate-pulse scale-125`;
    }
    
    if (finalResult === 1) {
      return `${baseClass} text-red-400 animate-bounce scale-125`;
    }
    
    return `${baseClass} text-blue-400 scale-110`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Dice Animation */}
        <div className="mb-8">
          <div className={getDiceClass()}>
            <svg 
              viewBox="0 0 100 100" 
              className="w-20 h-20 mx-auto fill-current"
              style={{ filter: finalResult === 20 ? 'drop-shadow(0 0 10px #fbbf24)' : finalResult === 1 ? 'drop-shadow(0 0 10px #f87171)' : 'none' }}
            >
              {/* D20 icosahedron - simplified but recognizable shape */}
              <defs>
                <linearGradient id="faceGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="faceGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="faceGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Main visible faces of the D20 */}
              {/* Top face */}
              <polygon 
                points="50,8 25,35 75,35" 
                fill="url(#faceGradient1)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.9"
              />
              
              {/* Left face */}
              <polygon 
                points="25,35 50,65 15,65" 
                fill="url(#faceGradient2)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.7"
              />
              
              {/* Right face */}
              <polygon 
                points="75,35 85,65 50,65" 
                fill="url(#faceGradient3)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.5"
              />
              
              {/* Bottom left face */}
              <polygon 
                points="15,65 50,65 30,85" 
                fill="url(#faceGradient2)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.6"
              />
              
              {/* Bottom right face */}
              <polygon 
                points="50,65 85,65 70,85" 
                fill="url(#faceGradient3)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.4"
              />
              
              {/* Bottom center face */}
              <polygon 
                points="30,85 70,85 50,92" 
                fill="url(#faceGradient2)" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                opacity="0.5"
              />
            </svg>
          </div>
          <div className="text-4xl font-bold mt-4 font-mono">
            {isRolling ? (
              <span className="text-white animate-pulse">
                {diceValue}
              </span>
            ) : (
              <span className={getResultColor()}>
                {finalResult}
              </span>
            )}
          </div>
        </div>

        {/* Result Text */}
        {showResult && (
          <div className="mb-6 animate-fade-in">
            <h2 className={`text-2xl font-bold mb-2 ${getResultColor()}`}>
              {getResultText()}
            </h2>
            {finalResult === 20 && (
              <div className="text-yellow-300 text-sm animate-pulse">
                ✨ Fortune favors you! ✨
              </div>
            )}
            {finalResult === 1 && (
              <div className="text-red-300 text-sm animate-pulse">
                💀 The dice gods frown upon you 💀
              </div>
            )}
          </div>
        )}

        {/* Loading Message */}
        <div className="text-slate-300 text-lg">
          {message}
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div 
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" 
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div 
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" 
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DiceLoading;
