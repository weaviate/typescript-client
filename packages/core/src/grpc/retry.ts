import { ClientError, Status } from 'nice-grpc-common';

export const retryOptions = {
  retry: true,
  retryMaxAttempts: 5,
  retryableStatuses: [Status.UNAVAILABLE],
  onRetryableError(error: ClientError, attempt: number, delayMs: number) {
    console.warn(error, `Attempt ${attempt} failed. Retrying in ${delayMs}ms.`);
  },
};
