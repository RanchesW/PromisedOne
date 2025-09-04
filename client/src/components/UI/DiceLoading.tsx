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
              viewBox="0 0 100 140" 
              className="w-20 h-20 mx-auto"
              style={{ filter: finalResult === 20 ? 'drop-shadow(0 0 10px #fbbf24)' : finalResult === 1 ? 'drop-shadow(0 0 10px #f87171)' : 'none' }}
            >
              {/* D20 Icosahedron - proper diamond proportions like reference */}
              
              {/* Outer hexagon shape */}
              <line x1="50" y1="10" x2="25" y2="40" stroke="currentColor" strokeWidth="2.5" />
              <line x1="50" y1="10" x2="75" y2="40" stroke="currentColor" strokeWidth="2.5" />
              <line x1="25" y1="40" x2="15" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="40" x2="85" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="15" y1="70" x2="25" y2="100" stroke="currentColor" strokeWidth="2.5" />
              <line x1="85" y1="70" x2="75" y2="100" stroke="currentColor" strokeWidth="2.5" />
              <line x1="25" y1="100" x2="50" y2="130" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="100" x2="50" y2="130" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Main diagonal lines from top tip to edges */}
              <line x1="50" y1="10" x2="15" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="50" y1="10" x2="85" y2="70" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Main diagonal lines from bottom tip to edges */}
              <line x1="50" y1="130" x2="15" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="50" y1="130" x2="85" y2="70" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Center vertical line */}
              <line x1="50" y1="10" x2="50" y2="130" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Horizontal center line */}
              <line x1="15" y1="70" x2="85" y2="70" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Internal triangulation */}
              <line x1="25" y1="40" x2="75" y2="100" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="40" x2="25" y2="100" stroke="currentColor" strokeWidth="2.5" />
              <line x1="25" y1="40" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="40" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="25" y1="100" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="75" y1="100" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Add dice numbers on main faces */}
              <text x="50" y="35" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">20</text>
              <text x="35" y="55" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">15</text>
              <text x="65" y="55" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">8</text>
              <text x="30" y="85" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">12</text>
              <text x="70" y="85" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">3</text>
              <text x="50" y="115" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">7</text>
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
