import { waitUntil } from "@vercel/functions";
import { processShipmentCreation } from "../shiprocket/orchestrator";

export interface QueueJob<T = any> {
  name: string;
  payload: T;
}

export interface QueueService {
  enqueue<T>(job: QueueJob<T>): Promise<void>;
}

/**
 * DefaultQueueService implements the abstract QueueService.
 * It uses Next.js `after()` to run tasks asynchronously after the response is sent,
 * ensuring the checkout flow is never blocked.
 * Failed tasks are picked up by the Vercel Cron endpoint.
 */
class DefaultQueueService implements QueueService {
  private handlers: Record<string, (payload: any) => Promise<void>> = {};

  registerHandler<T>(name: string, handler: (payload: T) => Promise<void>) {
    this.handlers[name] = handler;
  }

  async enqueue<T>(job: QueueJob<T>): Promise<void> {
    console.log(`[QueueService] Enqueuing job: ${job.name}`);
    
    waitUntil(
      (async () => {
        try {
          const handler = this.handlers[job.name];
          if (handler) {
            console.log(`[QueueService] Processing job: ${job.name}`);
            await handler(job.payload);
          } else {
            console.error(`[QueueService] No handler registered for job: ${job.name}`);
          }
        } catch (error) {
          console.error(`[QueueService] Job ${job.name} failed. It will be retried by the cron.`, error);
        }
      })()
    );
  }
}

export const queue = new DefaultQueueService();

// Register handlers
queue.registerHandler("create_shipment", async (payload: { orderNumber: string }) => {
  await processShipmentCreation(payload.orderNumber);
});
