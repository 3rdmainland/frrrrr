import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { menuQueryService } from '../index';
import type MenuDisplayItem from '../../../model/menu-display-item';

/**
 * Composable hook for browsing menu categories
 * @param initialPath Initial path to browse
 * @returns Object containing menu items, loading state, error state, and methods to interact with the menu
 */
export function useMenu(initialPath = 'main') {
  const menuItems = ref<MenuDisplayItem[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const currentPath = ref(initialPath);
  
  /**
   * Load menu items for a specific path
   * @param path Path to browse
   */
  const loadMenu = async (path: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await menuQueryService.browse(path);
      menuItems.value = result.children || [];
      currentPath.value = path;
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading menu:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Search the menu for products
   * @param query Search query
   */
  const searchMenu = async (query: string) => {
    if (!query.trim()) {
      return loadMenu(currentPath.value);
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      menuItems.value = await menuQueryService.search(query);
    } catch (err) {
      error.value = err as Error;
      console.error('Error searching menu:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Load menu on mount
  onMounted(() => {
    loadMenu(initialPath);
  });
  
  return {
    menuItems,
    isLoading,
    error,
    currentPath,
    loadMenu,
    searchMenu
  };
}