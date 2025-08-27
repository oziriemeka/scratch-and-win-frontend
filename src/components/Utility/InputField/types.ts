export type InputType = 'text' | 'email' | 'password';

export const validationStatusMap = {
  Error: 'error',
  Success: 'success',
} as const

export type ValidationStatus = typeof validationStatusMap[keyof typeof validationStatusMap]