/**
 * Enhanced Observable base class with TypeScript generics
 */
export type Observer<T extends string> = {
  notify: (event: T, ...args: any[]) => void;
};

export class Observable<T extends string = string> {
  private observers: Map<T, Set<Observer<T>>> = new Map();
  
  /**
   * Add an observer for a specific event
   * @param event The event to observe
   * @param observer The observer to add
   */
  addObserver<K extends T>(event: K, observer: Observer<K>): void {
    if (!this.observers.has(event)) {
      this.observers.set(event, new Set());
    }
    this.observers.get(event)!.add(observer as Observer<T>);
  }
  
  /**
   * Remove an observer for a specific event
   * @param event The event the observer is observing
   * @param observer The observer to remove
   */
  removeObserver<K extends T>(event: K, observer: Observer<K>): void {
    if (!this.observers.has(event)) return;
    
    const observers = this.observers.get(event)!;
    observers.delete(observer as Observer<T>);
    
    if (observers.size === 0) {
      this.observers.delete(event);
    }
  }
  
  /**
   * Notify all observers of an event
   * @param event The event that occurred
   * @param args Additional arguments to pass to observers
   */
  protected notifyObservers<K extends T>(event: K, ...args: any[]): void {
    if (!this.observers.has(event)) return;
    
    for (const observer of this.observers.get(event)!) {
      observer.notify(event, ...args);
    }
  }
}