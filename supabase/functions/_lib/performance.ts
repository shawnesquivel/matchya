/**
 * Performance tracking utility for Supabase Edge Functions
 * Tracks and logs execution times of different operations
 */

export type PerformanceData = {
  functionName: string;
  startTime: number;
  totalTime?: number;
  events: {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }[];
  summary?: Record<string, number>;
  coldStart: boolean;
};

// Track if this is first initialization per function
const coldStartMap = new Map<string, boolean>();

/**
 * Creates a new performance tracker for an edge function
 */
export function createPerformanceTracker(
  functionName: string
): PerformanceTracker {
  const isFirstInit = !coldStartMap.has(functionName);
  coldStartMap.set(functionName, false);

  return new PerformanceTracker(functionName, isFirstInit);
}

/**
 * Class to track performance metrics for edge functions
 */
export class PerformanceTracker {
  private data: PerformanceData;
  private activeEvents: Map<string, number>;

  constructor(functionName: string, isFirstInit: boolean) {
    this.data = {
      functionName,
      startTime: performance.now(),
      events: [],
      coldStart: isFirstInit,
    };
    this.activeEvents = new Map();

    console.log(`[${functionName}] ${isFirstInit ? "COLD" : "WARM"} start`);
  }

  /**
   * Start tracking a named event
   */
  startEvent(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeEvents.set(name, startTime);

    this.data.events.push({
      name,
      startTime,
      metadata,
    });
  }

  /**
   * End tracking a named event
   */
  endEvent(name: string, additionalMetadata?: Record<string, any>): number {
    const endTime = performance.now();
    const startTime = this.activeEvents.get(name);

    if (!startTime) {
      console.warn(
        `[${this.data.functionName}] Attempted to end event '${name}' that wasn't started`
      );
      return 0;
    }

    const duration = endTime - startTime;
    this.activeEvents.delete(name);

    // Find and update the event in the events array
    const event = this.data.events.find(
      (e) => e.name === name && e.endTime === undefined
    );
    if (event) {
      event.endTime = endTime;
      event.duration = duration;
      if (additionalMetadata) {
        event.metadata = { ...event.metadata, ...additionalMetadata };
      }
    }

    console.log(
      `[${this.data.functionName}] ${name} completed in ${duration.toFixed(
        2
      )}ms`
    );
    return duration;
  }

  /**
   * Tracks an async operation
   */
  async trackAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startEvent(name, metadata);
    try {
      const result = await operation();
      this.endEvent(name);
      return result;
    } catch (error) {
      this.endEvent(name, { error: error.message });
      throw error;
    }
  }

  /**
   * Complete the performance tracking and generate summary
   */
  complete(): PerformanceData {
    const endTime = performance.now();
    this.data.totalTime = endTime - this.data.startTime;

    // Generate summary by event type
    const summary: Record<string, number> = {};
    for (const event of this.data.events) {
      if (event.duration) {
        const category = event.name.split(":")[0];
        summary[category] = (summary[category] || 0) + event.duration;
      }
    }

    this.data.summary = summary;

    // Log the final performance report
    console.log(
      `[${
        this.data.functionName
      }] Execution completed in ${this.data.totalTime.toFixed(2)}ms`,
      {
        coldStart: this.data.coldStart,
        summary: this.data.summary,
      }
    );

    return this.data;
  }
}
