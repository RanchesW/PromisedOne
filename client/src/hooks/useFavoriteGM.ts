import { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';

export const useFavoriteGM = (gmId: string) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (gmId) {
      checkFavoriteStatus();
    }
  }, [gmId]);

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoriteService.isFavoriteGameMaster(gmId);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newStatus = await favoriteService.toggleFavoriteGameMaster(gmId);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setIsFavorite(!isFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    toggleFavorite
  };
};