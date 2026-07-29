export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const ALLOWED_EXTENSIONS = ['.xlsx', '.xlsm'] as const;
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroenabled.12',
] as const;

/**
 * ファイルの拡張子をチェック
 */
export function validateFileExtension(fileName: string): ValidationResult {
  const lastDot = fileName.lastIndexOf('.');
  const extension = lastDot >= 0 ? fileName.toLowerCase().slice(lastDot) : '';

  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Unsupported extension. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * ファイルのMIMEタイプをチェック
 */
export function validateFileMimeType(file: File): ValidationResult {
  const mimeType = file.type.toLowerCase();
  if (
    mimeType &&
    !ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `Unsupported MIME type: ${file.type}`,
    };
  }

  return { valid: true };
}

/**
 * 単一ファイルのバリデーション
 */
export function validateFile(file: File): ValidationResult {
  const extensionResult = validateFileExtension(file.name);
  if (!extensionResult.valid) {
    return extensionResult;
  }

  const mimeResult = validateFileMimeType(file);
  if (!mimeResult.valid) {
    return mimeResult;
  }

  return { valid: true };
}

/**
 * Kept for the frozen upload component. This tool accepts one workbook and does
 * not impose an additional size limit beyond the browser's available memory.
 */
export function validateTotalSize(_files: File[]): ValidationResult {
  return { valid: true };
}

/**
 * ファイル名のサニタイズ（危険な文字を除去）
 */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[/\\?%*:|"<>]/g, '_');
}
