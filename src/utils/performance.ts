
import {  LatLngBounds, type LatLngTuple } from 'leaflet';

export interface PolygonData {
  id: number;
  name: string;
  points: LatLngTuple[];
  bounds?: LatLngBounds;
}

/**
 * Simplify polygon using Ramer-Douglas-Peucker algorithm
 * Reduces number of points while maintaining shape
 * 
 * @param points - Array of [lat, lng] coordinates
 * @param tolerance - Simplification tolerance (higher = more aggressive)
 * @returns Simplified point array
 */
export function simplifyPolygon(
  points: LatLngTuple[],
  tolerance: number = 0.0001
): LatLngTuple[] {
  if (points.length < 3) return points;

  const sqTolerance = tolerance * tolerance;

  // Find point with maximum distance from line segment
  const getSqSegDist = (
    p: LatLngTuple,
    p1: LatLngTuple,
    p2: LatLngTuple
  ): number => {
    const [x, y] = p;
    let [x1, y1] = p1;
    const [x2, y2] = p2;

    let dx = x2 - x1;
    let dy = y2 - y1;

    if (dx !== 0 || dy !== 0) {
      const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x1 = x2;
        y1 = y2;
      } else if (t > 0) {
        x1 += dx * t;
        y1 += dy * t;
      }
    }

    dx = x - x1;
    dy = y - y1;

    return dx * dx + dy * dy;
  };

  const simplifyDPStep = (
    points: LatLngTuple[],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: LatLngTuple[]
  ) => {
    let maxSqDist = sqTolerance;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) {
        simplifyDPStep(points, first, index, sqTolerance, simplified);
      }
      simplified.push(points[index]);
      if (last - index > 1) {
        simplifyDPStep(points, index, last, sqTolerance, simplified);
      }
    }
  };

  const last = points.length - 1;
  const simplified: LatLngTuple[] = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

/**
 * Calculate bounding box for a polygon
 * Used for viewport culling
 * 
 * @param points - Array of [lat, lng] coordinates
 * @returns Bounding box { minLat, maxLat, minLng, maxLng }
 */
export function calculateBounds(points: LatLngTuple[]) {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLng = points[0][1];
  let maxLng = points[0][1];

  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Check if polygon is within viewport bounds
 * Used to avoid rendering off-screen polygons
 * 
 * @param polygonBounds - Polygon bounding box
 * @param viewportBounds - Current map viewport
 * @returns true if polygon intersects viewport
 */
export function isPolygonVisible(
  polygonBounds: ReturnType<typeof calculateBounds>,
  viewportBounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
  return !(
    polygonBounds.maxLat < viewportBounds.minLat ||
    polygonBounds.minLat > viewportBounds.maxLat ||
    polygonBounds.maxLng < viewportBounds.minLng ||
    polygonBounds.minLng > viewportBounds.maxLng
  );
}

/**
 * Debounce function to limit how often a function can fire
 * Useful for map move/zoom events
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure function fires at most once per interval
 * Useful for continuous events like mouse move
 * 
 * @param func - Function to throttle
 * @param limit - Milliseconds between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch process polygons to avoid blocking UI
 * Processes polygons in chunks with requestIdleCallback
 * 
 * @param items - Array of items to process
 * @param processFn - Function to process each item
 * @param chunkSize - Number of items per chunk
 */
export async function batchProcess<T>(
  items: T[],
  processFn: (item: T, index: number) => void,
  chunkSize: number = 100
): Promise<void> {
  const chunks: T[][] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    await new Promise<void>((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          chunks[i].forEach((item, idx) => processFn(item, i * chunkSize + idx));
          resolve();
        });
      } else {
        setTimeout(() => {
          chunks[i].forEach((item, idx) => processFn(item, i * chunkSize + idx));
          resolve();
        }, 0);
      }
    });
  }
}

/**
 * Get optimal simplification tolerance based on zoom level
 * Higher zoom = less simplification needed
 * 
 * @param zoomLevel - Current map zoom (6-19)
 * @returns Tolerance value for simplification
 */
export function getToleranceForZoom(zoomLevel: number): number {
  // Zoom levels: 6-9 (country), 10-13 (city), 14-16 (neighborhood), 17-19 (building)
  if (zoomLevel <= 9) return 0.01;   // Heavy simplification
  if (zoomLevel <= 13) return 0.001; // Medium simplification
  if (zoomLevel <= 16) return 0.0001; // Light simplification
  return 0; // No simplification at building level
}

/**
 * Calculate memory usage of polygon data
 * Useful for monitoring and optimization decisions
 * 
 * @param polygons - Array of polygon data
 * @returns Estimated memory usage in MB
 */
export function estimateMemoryUsage(polygons: PolygonData[]): number {
  // Rough estimate: each coordinate pair = 16 bytes (2 doubles)
  // Plus object overhead ~100 bytes per polygon
  
  let totalPoints = 0;
  for (const polygon of polygons) {
    totalPoints += polygon.points.length;
  }
  
  const pointsMemory = totalPoints * 16; // 16 bytes per coordinate pair
  const objectOverhead = polygons.length * 100; // 100 bytes per polygon object
  const totalBytes = pointsMemory + objectOverhead;
  
  return totalBytes / (1024 * 1024); // Convert to MB
}

/**
 * Check if browser supports high-performance features
 * @returns Object with feature support flags
 */
export function checkBrowserCapabilities() {
  return {
    webWorkers: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    requestIdleCallback: 'requestIdleCallback' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || 
          canvas.getContext('experimental-webgl')
        );
      } catch {
        return false;
      }
    })(),
  };
}

/**
 * Performance monitoring utility
 * Tracks operation timing for optimization
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number | null {
    const startTime = this.marks.get(label);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    
    if (!this.measures.has(label)) {
      this.measures.set(label, []);
    }
    this.measures.get(label)!.push(duration);
    
    this.marks.delete(label);
    return duration;
  }

  getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.measures.get(label);
    if (!measurements || measurements.length === 0) return null;

    const sum = measurements.reduce((a, b) => a + b, 0);
    return {
      avg: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length,
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Example usage in component:
/*
import { 
  simplifyPolygon, 
  calculateBounds, 
  isPolygonVisible,
  debounce,
  getToleranceForZoom,
  estimateMemoryUsage,
  PerformanceMonitor
} from './utils/performance';

// In component:
const monitor = new PerformanceMonitor();

// Simplify polygons based on zoom
const optimizedPolygons = polygons.map(p => ({
  ...p,
  points: simplifyPolygon(p.points, getToleranceForZoom(zoom))
}));

// Viewport culling
const visiblePolygons = polygons.filter(p => {
  const bounds = calculateBounds(p.points);
  return isPolygonVisible(bounds, mapBounds);
});

// Debounced map move handler
const handleMapMove = debounce(() => {
  updateVisiblePolygons();
}, 300);

// Monitor performance
monitor.start('render-polygons');
// ... render logic ...
const duration = monitor.end('render-polygons');
console.log(`Rendered in ${duration}ms`);
*/