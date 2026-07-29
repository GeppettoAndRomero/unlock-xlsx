import { describe, expect, it } from 'vitest';
import {
  sanitizeFileName,
  validateFile,
  validateFileExtension,
  validateFileMimeType,
  validateTotalSize,
} from '@/utils/fileValidation';

const file = (name: string, type = '', size = 1): File =>
  ({ name, type, size }) as File;

describe('file validation', () => {
  it('accepts .xlsx and .xlsm extensions regardless of case', () => {
    expect(validateFileExtension('book.XLSX').valid).toBe(true);
    expect(validateFileExtension('macros.XLSM').valid).toBe(true);
  });

  it('rejects unsupported and missing extensions', () => {
    expect(validateFileExtension('book.xls').valid).toBe(false);
    expect(validateFileExtension('book').valid).toBe(false);
  });

  it('accepts the XLSX and XLSM MIME types', () => {
    expect(
      validateFileMimeType(
        file(
          'book.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ).valid
    ).toBe(true);
    expect(
      validateFileMimeType(
        file('book.xlsm', 'application/vnd.ms-excel.sheet.macroEnabled.12')
      ).valid
    ).toBe(true);
  });

  it('allows an empty MIME type and rejects a conflicting MIME type', () => {
    expect(validateFileMimeType(file('book.xlsx')).valid).toBe(true);
    expect(validateFileMimeType(file('book.xlsx', 'text/plain')).valid).toBe(
      false
    );
  });

  it('validates extension and MIME together', () => {
    expect(
      validateFile(
        file(
          'book.xlsx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ).valid
    ).toBe(true);
    expect(validateFile(file('book.xls', 'application/vnd.ms-excel')).valid).toBe(
      false
    );
  });

  it('does not add an arbitrary size limit', () => {
    expect(validateTotalSize([file('book.xlsx', '', Number.MAX_SAFE_INTEGER)]).valid).toBe(
      true
    );
  });

  it('replaces path and reserved filename characters', () => {
    expect(sanitizeFileName('a/b\\c:d*e?.xlsx')).toBe('a_b_c_d_e_.xlsx');
  });
});
