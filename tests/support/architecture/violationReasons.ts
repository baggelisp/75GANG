export const ArchitectureViolationEnum = {
  FORBIDDEN_IMPORT: 'FORBIDDEN_IMPORT',
  FORBIDDEN_CLOCK_ACCESS: 'FORBIDDEN_CLOCK_ACCESS',
} as const;

export type ArchitectureViolationReason =
  (typeof ArchitectureViolationEnum)[keyof typeof ArchitectureViolationEnum];

export type ArchitectureViolation = {
  filePath: string;
  reason: ArchitectureViolationReason;
  detail: string;
};
