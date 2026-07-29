import {
  BlobReader,
  BlobWriter,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
  type Entry,
} from '@zip.js/zip.js';
import { AppError } from './appError';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const WORKBOOK_PATH = 'xl/workbook.xml';
const WORKBOOK_RELS_PATH = 'xl/_rels/workbook.xml.rels';
const WORKSHEET_PATH = /^xl\/worksheets\/sheet[^/]*\.xml$/i;
const CFB_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

export interface UnlockProgress {
  completed: number;
  total: number;
}

export interface UnlockResult {
  blob: Blob;
  protectedSheetNames: string[];
  sheetProtectionCount: number;
  workbookProtectionRemoved: boolean;
  protectionsRemoved: number;
}

type ProgressCallback = (progress: UnlockProgress) => void;

interface WorkbookSheet {
  name: string;
  relationshipId: string;
}

function elementsByLocalName(document: Document, localName: string): Element[] {
  return Array.from(document.getElementsByTagName('*')).filter(
    (element) =>
      element.localName === localName ||
      element.tagName.split(':').at(-1) === localName
  );
}

function parseXml(bytes: Uint8Array): Document {
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new AppError('errInvalidWorkbook');
  }

  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (elementsByLocalName(document, 'parsererror').length > 0) {
    throw new AppError('errInvalidWorkbook');
  }
  return document;
}

function serializeXml(document: Document): Uint8Array {
  return new TextEncoder().encode(new XMLSerializer().serializeToString(document));
}

function removeElements(document: Document, localName: string): number {
  const elements = elementsByLocalName(document, localName);
  for (const element of elements) {
    element.parentNode?.removeChild(element);
  }
  return elements.length;
}

function workbookSheets(document: Document): WorkbookSheet[] {
  return elementsByLocalName(document, 'sheet')
    .map((sheet) => ({
      name: sheet.getAttribute('name') ?? '',
      relationshipId:
        sheet.getAttribute('r:id') ??
        sheet.getAttributeNS(
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          'id'
        ) ??
        '',
    }))
    .filter((sheet) => sheet.name.length > 0);
}

function resolvePackagePath(baseFile: string, target: string): string {
  if (target.startsWith('/')) return target.slice(1);

  const segments = [...baseFile.split('/').slice(0, -1), ...target.split('/')];
  const normalized: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      normalized.pop();
    } else {
      normalized.push(segment);
    }
  }
  return normalized.join('/');
}

function sheetNamesByPath(
  workbookDocument: Document,
  relationshipsDocument: Document | null,
  worksheetPaths: string[]
): Map<string, string> {
  const sheets = workbookSheets(workbookDocument);
  const targetsById = new Map<string, string>();

  if (relationshipsDocument) {
    for (const relationship of elementsByLocalName(
      relationshipsDocument,
      'Relationship'
    )) {
      if (relationship.getAttribute('TargetMode') === 'External') continue;
      const id = relationship.getAttribute('Id');
      const target = relationship.getAttribute('Target');
      if (id && target) {
        targetsById.set(id, resolvePackagePath(WORKBOOK_PATH, target));
      }
    }
  }

  const names = new Map<string, string>();
  sheets.forEach((sheet, index) => {
    const relationshipTarget = targetsById.get(sheet.relationshipId);
    const fallbackTarget = worksheetPaths[index];
    const target = relationshipTarget ?? fallbackTarget;
    if (target) names.set(target, sheet.name);
  });
  return names;
}

function entryOptions(entry: Entry) {
  return {
    directory: entry.directory,
    comment: entry.comment,
    lastModDate: entry.lastModDate,
    lastAccessDate: entry.lastAccessDate,
    creationDate: entry.creationDate,
    internalFileAttributes: entry.internalFileAttributes,
    externalFileAttributes: entry.externalFileAttributes,
    version: entry.version,
    versionMadeBy: entry.versionMadeBy,
  };
}

async function assertZipPackage(file: File): Promise<void> {
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isCfb = CFB_SIGNATURE.every((byte, index) => header[index] === byte);
  if (isCfb) throw new AppError('errOpenPasswordProtected');

  const isZip =
    header[0] === 0x50 &&
    header[1] === 0x4b &&
    ((header[2] === 0x03 && header[3] === 0x04) ||
      (header[2] === 0x05 && header[3] === 0x06) ||
      (header[2] === 0x07 && header[3] === 0x08));
  if (!isZip) throw new AppError('errInvalidWorkbook');
}

/**
 * Removes OOXML sheet/workbook editing-protection elements.
 *
 * This does not recover or inspect passwords. It only removes sheetProtection and
 * workbookProtection elements from an already-openable OOXML package.
 */
export async function unlockXlsx(
  file: File,
  onProgress?: ProgressCallback
): Promise<UnlockResult> {
  await assertZipPackage(file);

  const reader = new ZipReader(new BlobReader(file));
  let writer: ZipWriter<Blob> | null = null;
  let writerClosed = false;

  try {
    let entries: Entry[];
    try {
      entries = await reader.getEntries();
    } catch {
      throw new AppError('errInvalidWorkbook');
    }

    if (entries.some((entry) => entry.encrypted)) {
      throw new AppError('errOpenPasswordProtected');
    }

    const entriesByName = new Map(entries.map((entry) => [entry.filename, entry]));
    const workbookEntry = entriesByName.get(WORKBOOK_PATH);
    if (!workbookEntry || workbookEntry.directory) {
      throw new AppError('errInvalidWorkbook');
    }

    const workbookBytes = await workbookEntry.getData(new Uint8ArrayWriter());
    const workbookDocument = parseXml(workbookBytes);
    const workbookProtectionCount = elementsByLocalName(
      workbookDocument,
      'workbookProtection'
    ).length;

    const worksheetPaths = entries
      .filter((entry) => !entry.directory && WORKSHEET_PATH.test(entry.filename))
      .map((entry) => entry.filename);

    const relationshipsEntry = entriesByName.get(WORKBOOK_RELS_PATH);
    let relationshipsDocument: Document | null = null;
    if (relationshipsEntry && !relationshipsEntry.directory) {
      relationshipsDocument = parseXml(
        await relationshipsEntry.getData(new Uint8ArrayWriter())
      );
    }
    const namesByPath = sheetNamesByPath(
      workbookDocument,
      relationshipsDocument,
      worksheetPaths
    );

    writer = new ZipWriter(new BlobWriter(XLSX_MIME));
    const protectedSheetNames = new Set<string>();
    let sheetProtectionCount = 0;
    let completed = 0;
    onProgress?.({ completed, total: entries.length });

    for (const entry of entries) {
      if (entry.directory) {
        await writer.add(entry.filename, undefined, entryOptions(entry));
      } else {
        let data: Uint8Array;
        if (entry.filename === WORKBOOK_PATH) {
          data = workbookBytes;
          if (workbookProtectionCount > 0) {
            removeElements(workbookDocument, 'workbookProtection');
            data = serializeXml(workbookDocument);
          }
        } else {
          data = await entry.getData(new Uint8ArrayWriter());
          if (WORKSHEET_PATH.test(entry.filename)) {
            const worksheetDocument = parseXml(data);
            const removed = removeElements(
              worksheetDocument,
              'sheetProtection'
            );
            if (removed > 0) {
              sheetProtectionCount += removed;
              protectedSheetNames.add(
                namesByPath.get(entry.filename) ??
                  entry.filename.split('/').at(-1)?.replace(/\.xml$/i, '') ??
                  entry.filename
              );
              data = serializeXml(worksheetDocument);
            }
          }
        }

        await writer.add(
          entry.filename,
          new Uint8ArrayReader(data),
          entryOptions(entry)
        );
      }

      completed += 1;
      onProgress?.({ completed, total: entries.length });
    }

    const blob = await writer.close();
    writerClosed = true;
    return {
      blob,
      protectedSheetNames: Array.from(protectedSheetNames),
      sheetProtectionCount,
      workbookProtectionRemoved: workbookProtectionCount > 0,
      protectionsRemoved: sheetProtectionCount + workbookProtectionCount,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('errInvalidWorkbook');
  } finally {
    await reader.close().catch(() => undefined);
    if (writer && !writerClosed) {
      await writer.close().catch(() => undefined);
    }
  }
}

export function unlockedFileName(originalName: string): string {
  const baseName = originalName.replace(/\.(xlsx|xlsm)$/i, '');
  return `${baseName}-unlocked.xlsx`;
}
