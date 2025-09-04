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
    }, duration * 0.7);

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
              style={{ 
                filter: finalResult === 20 
                  ? 'drop-shadow(0 0 10px #fbbf24)' 
                  : finalResult === 1 
                  ? 'drop-shadow(0 0 10px #f87171)' 
                  : 'none' 
              }}
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                shapeRendering="geometricPrecision"
              >
                {/* === OUTER SILHOUETTE (decagon) === */}
                <polygon points="
                  60,8
                  88,18
                  106,40
                  106,80
                  88,102
                  60,112
                  32,102
                  14,80
                  14,40
                  32,18
                " />

                {/* === PRIMARY SEAMS (recognizable d20 wiring) === */}
                {/* vertical spine */}
                <line x1="60" y1="8"  x2="60" y2="112" />

                {/* top fan from apex */}
                <line x1="60" y1="8"  x2="88" y2="18" />
                <line x1="60" y1="8"  x2="32" y2="18" />
                <line x1="60" y1="8"  x2="106" y2="40" />
                <line x1="60" y1="8"  x2="14"  y2="40" />

                {/* bottom fan into nadir */}
                <line x1="60" y1="112" x2="88" y2="102" />
                <line x1="60" y1="112" x2="32" y2="102" />
                <line x1="60" y1="112" x2="106" y2="80" />
                <line x1="60" y1="112" x2="14"  y2="80" />

                {/* equator & belts */}
                <line x1="20" y1="60" x2="100" y2="60" />
                <line x1="32" y1="18" x2="88"  y2="18" />
                <line x1="14" y1="40" x2="106" y2="40" />
                <line x1="32" y1="102" x2="88"  y2="102" />
                <line x1="14" y1="80" x2="106" y2="80" />

                {/* short edge connectors (adds the classic triangular tiling) */}
                <line x1="32" y1="18" x2="14"  y2="40" />
                <line x1="88" y1="18" x2="106" y2="40" />
                <line x1="14" y1="80" x2="32"  y2="102" />
                <line x1="106" y1="80" x2="88" y2="102" />
              </g>

              {/* Roll result number inside dice */}
              <text
                x="60"
                y="64"
                fontSize="24"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
              >
                {diceValue}
              </text>
            </svg>
          </div>
        </div>

        {/* Result Text */}
        {showResult && (
          <div className="mb-6 animate-fade-in">
            <h2 className={`text-2xl font-bold mb-2 ${getResultColor()}`}>
              {getResultText()}
            </h2>
          </div>
        )}

        {/* Loading Message */}
        <div className="text-slate-300 text-lg">
          {message}
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DiceLoading;