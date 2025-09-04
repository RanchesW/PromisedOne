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
              viewBox="0 0 120 120" 
              className="w-20 h-20 mx-auto fill-current"
              style={{ filter: finalResult === 20 ? 'drop-shadow(0 0 10px #fbbf24)' : finalResult === 1 ? 'drop-shadow(0 0 10px #f87171)' : 'none' }}
            >
              {/* Proper D20 icosahedron with correct geometry */}
              <defs>
                <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="brightFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="mediumFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="darkFace" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Icosahedron structure - 20 triangular faces, showing 7-9 visible faces */}
              
              {/* Top face - brightest */}
              <polygon 
                points="60,15 35,40 85,40" 
                fill="url(#topFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="1"
              />
              
              {/* Top ring - 5 faces around the top face */}
              {/* Top-left face */}
              <polygon 
                points="35,40 60,15 20,50" 
                fill="url(#brightFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.9"
              />
              
              {/* Top-right face */}
              <polygon 
                points="85,40 60,15 100,50" 
                fill="url(#brightFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.8"
              />
              
              {/* Left face */}
              <polygon 
                points="20,50 35,40 25,70" 
                fill="url(#mediumFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.75"
              />
              
              {/* Right face */}
              <polygon 
                points="100,50 85,40 95,70" 
                fill="url(#darkFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.6"
              />
              
              {/* Center face */}
              <polygon 
                points="35,40 85,40 60,65" 
                fill="url(#mediumFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.8"
              />
              
              {/* Bottom ring - faces tapering to bottom point */}
              {/* Bottom-left face */}
              <polygon 
                points="25,70 35,40 60,65" 
                fill="url(#mediumFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.7"
              />
              
              {/* Bottom-right face */}
              <polygon 
                points="95,70 85,40 60,65" 
                fill="url(#darkFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.55"
              />
              
              {/* Bottom faces converging to point */}
              <polygon 
                points="25,70 60,65 40,95" 
                fill="url(#darkFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.65"
              />
              
              <polygon 
                points="60,65 95,70 80,95" 
                fill="url(#darkFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.5"
              />
              
              {/* Bottom tip face */}
              <polygon 
                points="40,95 80,95 60,105" 
                fill="url(#darkFace)" 
                stroke="currentColor" 
                strokeWidth="1.2" 
                opacity="0.45"
              />
              
              {/* Add numbers on visible faces to make it clearly a dice */}
              <text x="60" y="30" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.9" fontWeight="bold">20</text>
              <text x="45" y="50" textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.8" fontWeight="bold">15</text>
              <text x="75" y="50" textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.7" fontWeight="bold">8</text>
              <text x="60" y="70" textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.7" fontWeight="bold">12</text>
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
