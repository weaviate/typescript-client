import { ClientError, Status } from 'nice-grpc';
import { RetryOptions } from 'nice-grpc-client-middleware-retry';

export const retryOptions: RetryOptions = {
  retry: true,
  retryMaxAttempts: 5,
  retryableStatuses: [Status.UNAVAILABLE],
  onRetryableError(error: ClientError, attempt: number, delayMs: number) {
    console.warn(error, `Attempt ${attempt} failed. Retrying in ${delayMs}ms.`);
  },
};
