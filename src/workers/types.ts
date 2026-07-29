/**
 * Compatibility types used by frozen status/download widgets inherited from
 * the shared tool shell. unlock-xlsx itself does not create worker jobs.
 */
import type { ConversionSettings } from '@/utils/settings';

export type JobStatus = 'pending' | 'processing' | 'succeeded' | 'failed';
export type ProcessingPhase =
  | 'decode'
  | 'resize'
  | 'encode'
  | 'complete';

export interface ConversionJob {
  id: string;
  file: File;
  settings: ConversionSettings;
  status: JobStatus;
  phase?: ProcessingPhase;
  progress: number;
  result?: Blob;
  error?: string;
}
