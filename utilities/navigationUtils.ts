'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Navigation Manager Class
class NavigationManager {
  private router: ReturnType<typeof useRouter> | null = null;

  // Set router instance (called from hook)
  public setRouter = (routerInstance: ReturnType<typeof useRouter>) => {
    this.router = routerInstance;
  };

  public navigateTo = (route: string) => {
    if (!this.router) {
      console.error('Router not initialized. Use useNavigation hook.');
      return;
    }

    try {
      this.router.push(route);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
}

// Create singleton instance
export const navigationManager = new NavigationManager();

// Custom hook for navigation
export const useNavigation = () => {
  const router = useRouter();
  
  // Initialize router in navigation manager
  navigationManager.setRouter(router);

  const navigateTo = useCallback((route: string) => {
    navigationManager.navigateTo(route);
  }, []);

  return { navigateTo };
};

