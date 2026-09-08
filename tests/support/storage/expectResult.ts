import { Result, StorageErrorReason } from '@/domain/result';

/** Unwraps a successful result, so no test body needs a conditional to read a value. */
export const expectValue = <TValue>(result: Result<TValue>): TValue => {
  if (!result.ok) {
    throw new Error(`Expected a value but the read failed with ${result.error.reason}`);
  }

  return result.value;
};

export const expectFailure = <TValue>(result: Result<TValue>): StorageErrorReason => {
  if (result.ok) {
    throw new Error('Expected a failure but the operation succeeded');
  }

  return result.error.reason;
};
