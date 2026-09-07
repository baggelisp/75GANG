export const StorageErrorEnum = {
  CORRUPT_JSON: 'CORRUPT_JSON',
  INVALID_SHAPE: 'INVALID_SHAPE',
  READ_FAILED: 'READ_FAILED',
  WRITE_FAILED: 'WRITE_FAILED',
} as const;

export type StorageErrorReason = (typeof StorageErrorEnum)[keyof typeof StorageErrorEnum];

export type StorageError = {
  reason: StorageErrorReason;
  key: string;
};

export type Result<TValue> = { ok: true; value: TValue } | { ok: false; error: StorageError };

export const succeed = <TValue>(value: TValue): Result<TValue> => ({ ok: true, value });

export const fail = <TValue>(reason: StorageErrorReason, key: string): Result<TValue> => ({
  ok: false,
  error: { reason, key },
});
