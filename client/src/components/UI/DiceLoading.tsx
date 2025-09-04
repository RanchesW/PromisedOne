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
              className="w-20 h-20 mx-auto"
              style={{ filter: finalResult === 20 ? 'drop-shadow(0 0 10px #fbbf24)' : finalResult === 1 ? 'drop-shadow(0 0 10px #f87171)' : 'none' }}
            >
              {/* D20 Icosahedron Wireframe - matching reference geometry */}
              
              {/* Top point */}
              <circle cx="60" cy="15" r="1" fill="currentColor" />
              
              {/* Bottom point */}
              <circle cx="60" cy="105" r="1" fill="currentColor" />
              
              {/* Top pentagon ring coordinates */}
              {/* Top ring: 5 points in a pentagon around the top */}
              <line x1="60" y1="15" x2="60" y2="45" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="15" x2="30" y2="35" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="15" x2="90" y2="35" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="15" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="15" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
              
              {/* Bottom pentagon ring - mirror of top */}
              <line x1="60" y1="105" x2="60" y2="75" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="105" x2="30" y2="85" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="105" x2="90" y2="85" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="105" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="105" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
              
              {/* Top pentagon edges */}
              <line x1="60" y1="45" x2="30" y2="35" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="35" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="20" y1="60" x2="60" y2="75" stroke="currentColor" strokeWidth="2" />
              <line x1="60" y1="75" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="60" x2="90" y2="35" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="35" x2="60" y2="45" stroke="currentColor" strokeWidth="2" />
              
              {/* Bottom pentagon edges */}
              <line x1="60" y1="75" x2="30" y2="85" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="85" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="60" x2="90" y2="85" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="85" x2="60" y2="75" stroke="currentColor" strokeWidth="2" />
              
              {/* Middle belt connecting top and bottom pentagons */}
              <line x1="60" y1="45" x2="60" y2="75" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="35" x2="30" y2="85" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="35" x2="90" y2="85" stroke="currentColor" strokeWidth="2" />
              
              {/* Cross triangulation for proper icosahedron structure */}
              <line x1="30" y1="35" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="35" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="30" y1="85" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="90" y1="85" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
              
              {/* Add dice numbers on visible faces */}
              <text x="60" y="25" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">20</text>
              <text x="45" y="40" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">15</text>
              <text x="75" y="40" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">8</text>
              <text x="35" y="60" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">12</text>
              <text x="85" y="60" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">3</text>
              <text x="60" y="90" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">7</text>
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
