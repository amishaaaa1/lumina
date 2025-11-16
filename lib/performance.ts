/**
 * Performance monitoring and optimization utilities
 */

// Web Vitals tracking
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
}

// Performance marks and measures
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
    if (typeof performance.mark === 'function') {
      performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (start && end) {
      const duration = end - start;
      
      if (typeof performance.measure === 'function') {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          // Ignore if marks don't exist
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }

      return duration;
    }

    return 0;
  }

  clear() {
    this.marks.clear();
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
    }
    if (typeof performance.clearMeasures === 'function') {
      performance.clearMeasures();
    }
  }
}

export const perfMonitor = new PerformanceMonitor();

// Resource timing
export function getResourceTiming() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return [];
  }

  return performance.getEntriesByType('resource').map((entry: any) => ({
    name: entry.name,
    duration: entry.duration,
    size: entry.transferSize,
    type: entry.initiatorType,
  }));
}

// Long task detection
export function observeLongTasks(callback: (duration: number) => void) {
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          callback(entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch (e) {
    return () => {};
  }
}

// Memory usage (Chrome only)
export function getMemoryUsage() {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// FPS monitoring
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private rafId: number | null = null;

  start(callback: (fps: number) => void) {
    const measure = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastTime;

      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        callback(this.fps);
        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFPS() {
    return this.fps;
  }
}

// Bundle size tracking
export function logBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    console.log('[Bundle Size]', {
      files: jsResources.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      resources: jsResources.map(r => ({
        name: r.name.split('/').pop(),
        size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`,
      })),
    });
  }
}

// Lazy load images
export function lazyLoadImage(img: HTMLImageElement) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
          }
          observer.unobserve(image);
        }
      });
    });

    observer.observe(img);
    return () => observer.unobserve(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    return () => {};
  }
}
