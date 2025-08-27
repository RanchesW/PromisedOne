import React from 'react';
import DiceLoading from './DiceLoading';
import { useRouteTransition } from '../../contexts/RouteTransitionContext';

interface RouteTransitionWrapperProps {
  children: React.ReactNode;
}

const RouteTransitionWrapper: React.FC<RouteTransitionWrapperProps> = ({ children }) => {
  const { isTransitioning, transitionMessage } = useRouteTransition();

  console.log('RouteTransitionWrapper render:', { isTransitioning, transitionMessage }); // Debug log

  return (
    <>
      {children}
      {isTransitioning && (
        <DiceLoading 
          message={transitionMessage} 
          duration={2000}
          onComplete={() => {
            console.log('Dice loading completed'); // Debug log
            // Transition completion is handled by the context
          }}
        />
      )}
    </>
  );
};

export default RouteTransitionWrapper;
