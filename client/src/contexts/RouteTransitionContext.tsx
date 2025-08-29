import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface RouteTransitionContextType {
  isTransitioning: boolean;
  transitionMessage: string;
  navigateWithTransition: (to: string, message?: string, duration?: number, navigationOptions?: any) => void;
  navigateWithoutTransition: (to: string) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextType | undefined>(undefined);

interface RouteTransitionProviderProps {
  children: React.ReactNode;
}

export const RouteTransitionProvider: React.FC<RouteTransitionProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((
    to: string, 
    message: string = 'Loading...', 
    duration: number = 2000,
    navigationOptions?: any
  ) => {
    console.log('Starting transition:', { to, message, duration }); // Debug log
    setTransitionMessage(message);
    setIsTransitioning(true);

    setTimeout(() => {
      console.log('Navigating to:', to); // Debug log
      try {
        if (navigationOptions) {
          navigate(to, navigationOptions);
        } else {
          navigate(to);
        }
        console.log('Navigation completed successfully'); // Debug log
      } catch (error) {
        console.error('Navigation error:', error); // Debug log
      }
      setTimeout(() => {
        setIsTransitioning(false);
        console.log('Transition completed'); // Debug log
      }, 500); // Small delay to ensure navigation completes
    }, duration);
  }, [navigate]);

  const navigateWithoutTransition = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  return (
    <RouteTransitionContext.Provider
      value={{
        isTransitioning,
        transitionMessage,
        navigateWithTransition,
        navigateWithoutTransition,
        setIsTransitioning,
      }}
    >
      {children}
    </RouteTransitionContext.Provider>
  );
};

export const useRouteTransition = () => {
  const context = useContext(RouteTransitionContext);
  if (context === undefined) {
    throw new Error('useRouteTransition must be used within a RouteTransitionProvider');
  }
  return context;
};
