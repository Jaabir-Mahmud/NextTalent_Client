// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a specific operation
  startTimer(operationName) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    this.metrics.set(operationName, { startTime, endTime: null, duration: null });
    
    return () => this.endTimer(operationName);
  }

  // End timing and log the result
  endTimer(operationName) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(operationName);
    if (!metric) return;
    
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Log performance data
    console.log(`⏱️ ${operationName}: ${metric.duration.toFixed(2)}ms`);
    
    // Warn if operation takes too long
    if (metric.duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${operationName} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  // Monitor component render performance
  monitorComponentRender(componentName) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      console.log(`🎨 ${componentName} render: ${duration.toFixed(2)}ms`);
      
      if (duration > 16) { // 60fps threshold
        console.warn(`⚠️ Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  // Monitor Firebase query performance
  monitorFirebaseQuery(collectionName, operation = 'query') {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      console.log(`🔥 Firebase ${operation} (${collectionName}): ${duration.toFixed(2)}ms`);
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow Firebase operation: ${collectionName} ${operation} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    if (!this.isEnabled || !performance.memory) return;
    
    const memory = performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
    const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
    
    console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB (${limitMB}MB limit)`);
    
    if (usedMB / limitMB > 0.8) {
      console.warn(`⚠️ High memory usage: ${Math.round((usedMB / limitMB) * 100)}% of limit`);
    }
  }

  // Monitor network requests
  monitorNetworkRequest(url, method = 'GET') {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      console.log(`🌐 ${method} ${url}: ${duration.toFixed(2)}ms`);
      
      if (duration > 3000) {
        console.warn(`⚠️ Slow network request: ${method} ${url} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  // Monitor scroll performance
  monitorScroll(threshold = 16) {
    if (!this.isEnabled) return;
    
    let lastScrollTime = 0;
    let scrollCount = 0;
    
    const handleScroll = () => {
      const now = performance.now();
      const timeSinceLastScroll = now - lastScrollTime;
      
      if (timeSinceLastScroll < threshold) {
        scrollCount++;
        if (scrollCount > 10) {
          console.warn(`⚠️ Scroll performance issue: ${scrollCount} scrolls in ${timeSinceLastScroll.toFixed(2)}ms`);
        }
      } else {
        scrollCount = 0;
      }
      
      lastScrollTime = now;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }

  // Monitor long tasks
  monitorLongTasks() {
    if (!this.isEnabled || !window.PerformanceObserver) return;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // 50ms threshold
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    return () => observer.disconnect();
  }

  // Get performance summary
  getSummary() {
    if (!this.isEnabled) return;
    
    const summary = {
      metrics: Array.from(this.metrics.entries()),
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null,
      navigation: performance.getEntriesByType('navigation')[0] || null
    };
    
    console.log('📊 Performance Summary:', summary);
    return summary;
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;

// React hook for monitoring component performance
export const usePerformanceMonitor = (componentName) => {
  React.useEffect(() => {
    if (!performanceMonitor.isEnabled) return;
    
    const endTimer = performanceMonitor.monitorComponentRender(componentName);
    return endTimer;
  });
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    usePerformanceMonitor(componentName);
    return <WrappedComponent {...props} />;
  });
}; 