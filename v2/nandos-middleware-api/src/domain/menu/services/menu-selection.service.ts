import { Observable } from '../../../core/utils/observable';
import type { MenuEvent } from '../types';

/**
 * Service for managing menu selection
 */
export class MenuSelectionService extends Observable<MenuEvent> {
  private selectedMenuId: string | null = null;
  private selectedStoreId: string | null = null;
  
  /**
   * Get the currently selected menu ID
   * @returns The selected menu ID or null if none is selected
   */
  getSelectedMenuId(): string | null {
    return this.selectedMenuId;
  }
  
  /**
   * Set the selected menu ID
   * @param menuId The menu ID to select
   */
  setSelectedMenuId(menuId: string | null): void {
    const oldMenuId = this.selectedMenuId;
    this.selectedMenuId = menuId;
    
    if (oldMenuId !== menuId) {
      this.notifyObservers('menuChanged', menuId);
    }
  }
  
  /**
   * Get the currently selected store ID
   * @returns The selected store ID or null if none is selected
   */
  getSelectedStoreId(): string | null {
    return this.selectedStoreId;
  }
  
  /**
   * Set the selected store ID
   * @param storeId The store ID to select
   */
  setSelectedStoreId(storeId: string | null): void {
    this.selectedStoreId = storeId;
    
    // When the store changes, we might need to update the menu
    // This could trigger a menu reload in components that observe this event
    this.notifyObservers('menuChanged', this.selectedMenuId);
  }
}