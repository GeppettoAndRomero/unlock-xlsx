import { describe, expect, it } from 'vitest';
import { AppError, resolveErrorMessage } from '@/utils/appError';

const messages = {
  errInvalidWorkbook: 'Invalid workbook',
  errConversionFailed: 'Processing failed',
  errWithValue: 'Removed {count} items',
};

describe('resolveErrorMessage', () => {
  it('maps AppError and string codes', () => {
    expect(
      resolveErrorMessage(new AppError('errInvalidWorkbook'), messages)
    ).toBe('Invalid workbook');
    expect(resolveErrorMessage('errInvalidWorkbook', messages)).toBe(
      'Invalid workbook'
    );
  });

  it('interpolates AppError parameters', () => {
    expect(
      resolveErrorMessage(new AppError('errWithValue', { count: 2 }), messages)
    ).toBe('Removed 2 items');
  });

  it('uses the localized fallback for unknown errors', () => {
    expect(resolveErrorMessage(new Error('internal detail'), messages)).toBe(
      'Processing failed'
    );
  });
});
