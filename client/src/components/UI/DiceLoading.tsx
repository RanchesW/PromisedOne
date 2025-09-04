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
              {/* Proper D20 icosahedron shape */}
              {/* Top pyramid faces */}
              <polygon points="60,10 40,35 60,30" className="fill-current opacity-95 stroke-current stroke-1" />
              <polygon points="60,10 80,35 60,30" className="fill-current opacity-90 stroke-current stroke-1" />
              <polygon points="60,10 80,35 85,20" className="fill-current opacity-85 stroke-current stroke-1" />
              <polygon points="60,10 40,35 35,20" className="fill-current opacity-85 stroke-current stroke-1" />
              
              {/* Upper middle faces */}
              <polygon points="40,35 60,30 45,50" className="fill-current opacity-80 stroke-current stroke-1" />
              <polygon points="60,30 80,35 75,50" className="fill-current opacity-75 stroke-current stroke-1" />
              <polygon points="80,35 85,20 95,40" className="fill-current opacity-70 stroke-current stroke-1" />
              <polygon points="40,35 35,20 25,40" className="fill-current opacity-70 stroke-current stroke-1" />
              
              {/* Center belt faces */}
              <polygon points="45,50 60,55 60,70" className="fill-current opacity-75 stroke-current stroke-1" />
              <polygon points="60,55 75,50 60,70" className="fill-current opacity-65 stroke-current stroke-1" />
              <polygon points="25,40 40,35 45,50" className="fill-current opacity-60 stroke-current stroke-1" />
              <polygon points="95,40 80,35 75,50" className="fill-current opacity-60 stroke-current stroke-1" />
              
              {/* Lower middle faces */}
              <polygon points="45,50 60,70 40,80" className="fill-current opacity-65 stroke-current stroke-1" />
              <polygon points="75,50 60,70 80,80" className="fill-current opacity-55 stroke-current stroke-1" />
              <polygon points="25,40 45,50 40,80" className="fill-current opacity-50 stroke-current stroke-1" />
              <polygon points="95,40 75,50 80,80" className="fill-current opacity-50 stroke-current stroke-1" />
              
              {/* Bottom pyramid faces */}
              <polygon points="40,80 60,70 60,105" className="fill-current opacity-55 stroke-current stroke-1" />
              <polygon points="60,70 80,80 60,105" className="fill-current opacity-45 stroke-current stroke-1" />
              <polygon points="25,40 40,80 35,95" className="fill-current opacity-40 stroke-current stroke-1" />
              <polygon points="95,40 80,80 85,95" className="fill-current opacity-40 stroke-current stroke-1" />
              
              {/* Bottom tip faces */}
              <polygon points="40,80 60,105 35,95" className="fill-current opacity-45 stroke-current stroke-1" />
              <polygon points="80,80 60,105 85,95" className="fill-current opacity-35 stroke-current stroke-1" />
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
