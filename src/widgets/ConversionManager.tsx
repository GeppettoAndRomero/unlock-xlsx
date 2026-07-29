import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { ErrorToast } from './ErrorToast';
import { resolveErrorMessage } from '@/utils/appError';
import { validateFile } from '@/utils/fileValidation';
import {
  unlockXlsx,
  unlockedFileName,
  type UnlockResult,
} from '@/utils/xlsxUnlockEngine';

interface ErrorToastItem {
  id: string;
  message: string;
}

interface ConversionManagerProps {
  locale?: string;
}

const copy = {
  en: {
    uploadHeading: 'Choose an Excel workbook',
    uploadSubtitle: 'Select one .xlsx or .xlsm file.',
    dropClick: 'Click to choose a workbook',
    dropOr: 'or drop it anywhere on the page',
    dropSupported: 'Supported: XLSX and XLSM',
    authorization:
      'Use this tool only with workbooks you own or are authorized to modify.',
    scope:
      'It removes sheet and workbook editing protection. It cannot remove a password required to open the file, file encryption, or VBA project protection.',
    processing: 'Inspecting and rebuilding the workbook…',
    resultHeading: 'Result',
    sheetsUnlocked: 'Sheet protection removed from: {names}.',
    nameSeparator: ', ',
    workbookUnlocked: 'Workbook structure protection was removed.',
    noProtection: 'No sheet or workbook protection was found in this file.',
    downloadStarted: 'The unlocked workbook download has started.',
    downloadAgain: 'Download again',
    notificationsAria: 'Notifications',
    close: 'Close',
    errUnsupported:
      '{name} is not a supported workbook. Choose an .xlsx or .xlsm file.',
    errSingleFile: 'Choose one workbook at a time.',
    errOpenPasswordProtected:
      'This file is protected by a password required to open it. This tool only removes sheet or workbook protection; it cannot remove an opening password.',
    errInvalidWorkbook:
      'The workbook could not be read as an XLSX or XLSM file. It may be damaged or use an unsupported container.',
    errConversionFailed: 'The workbook could not be processed.',
  },
  ja: {
    uploadHeading: 'Excel ブックを選択',
    uploadSubtitle: '.xlsx または .xlsm を1ファイル選んでください。',
    dropClick: 'クリックしてブックを選択',
    dropOr: 'またはページ上にドロップ',
    dropSupported: '対応形式: XLSX、XLSM',
    authorization:
      '自分が所有している、または変更する権限を持つブックにのみ使用してください。',
    scope:
      'シートの編集保護とブック構成の保護を解除します。ファイルを開くためのパスワード、ファイル暗号化、VBA プロジェクトの保護は解除できません。',
    processing: 'ブックを確認して再構成しています…',
    resultHeading: '処理結果',
    sheetsUnlocked: '次のシートの保護を解除しました: {names}。',
    nameSeparator: '、',
    workbookUnlocked: 'ブック構成の保護を解除しました。',
    noProtection: 'このファイルにはシートまたはブックの保護が見つかりませんでした。',
    downloadStarted: '保護を解除したブックのダウンロードを開始しました。',
    downloadAgain: 'もう一度ダウンロード',
    notificationsAria: '通知',
    close: '閉じる',
    errUnsupported:
      '{name} は対応形式ではありません。.xlsx または .xlsm を選んでください。',
    errSingleFile: 'ブックは1ファイルずつ選んでください。',
    errOpenPasswordProtected:
      'このファイルは、開くためのパスワードで保護されています。このツールが対応するのはシート保護とブック構成の保護のみで、開封パスワードは解除できません。',
    errInvalidWorkbook:
      'XLSX / XLSM ブックとして読み取れませんでした。ファイルが破損しているか、対応外のコンテナである可能性があります。',
    errConversionFailed: 'ブックを処理できませんでした。',
  },
  zh: {
    uploadHeading: '选择 Excel 工作簿',
    uploadSubtitle: '请选择一个 .xlsx 或 .xlsm 文件。',
    dropClick: '点击选择工作簿',
    dropOr: '或拖放到页面任意位置',
    dropSupported: '支持：XLSX、XLSM',
    authorization: '请仅处理您拥有或获准修改的工作簿。',
    scope:
      '本工具会移除工作表编辑保护和工作簿结构保护，但不能移除打开文件所需的密码、文件加密或 VBA 项目保护。',
    processing: '正在检查并重新生成工作簿…',
    resultHeading: '处理结果',
    sheetsUnlocked: '已移除以下工作表的保护：{names}。',
    nameSeparator: '、',
    workbookUnlocked: '已移除工作簿结构保护。',
    noProtection: '未在此文件中发现工作表或工作簿保护。',
    downloadStarted: '已开始下载解除保护后的工作簿。',
    downloadAgain: '再次下载',
    notificationsAria: '通知',
    close: '关闭',
    errUnsupported: '{name} 不是支持的工作簿。请选择 .xlsx 或 .xlsm 文件。',
    errSingleFile: '每次请选择一个工作簿。',
    errOpenPasswordProtected:
      '此文件需要密码才能打开。本工具仅移除工作表或工作簿保护，不能移除打开文件所需的密码。',
    errInvalidWorkbook:
      '无法将此文件读取为 XLSX 或 XLSM 工作簿。文件可能已损坏，或使用了不支持的容器。',
    errConversionFailed: '无法处理此工作簿。',
  },
  de: {
    uploadHeading: 'Excel-Arbeitsmappe auswählen',
    uploadSubtitle: 'Wähle eine .xlsx- oder .xlsm-Datei aus.',
    dropClick: 'Zum Auswählen einer Arbeitsmappe klicken',
    dropOr: 'oder die Datei auf der Seite ablegen',
    dropSupported: 'Unterstützt: XLSX und XLSM',
    authorization:
      'Verwende dieses Werkzeug nur für Arbeitsmappen, die dir gehören oder die du bearbeiten darfst.',
    scope:
      'Es entfernt den Bearbeitungsschutz von Blättern und den Strukturschutz der Arbeitsmappe. Öffnungskennwörter, Dateiverschlüsselung und der Schutz von VBA-Projekten werden nicht entfernt.',
    processing: 'Arbeitsmappe wird geprüft und neu gepackt…',
    resultHeading: 'Ergebnis',
    sheetsUnlocked: 'Blattschutz entfernt für: {names}.',
    nameSeparator: ', ',
    workbookUnlocked: 'Der Strukturschutz der Arbeitsmappe wurde entfernt.',
    noProtection:
      'In dieser Datei wurde kein Blatt- oder Arbeitsmappenschutz gefunden.',
    downloadStarted:
      'Der Download der entsperrten Arbeitsmappe wurde gestartet.',
    downloadAgain: 'Erneut herunterladen',
    notificationsAria: 'Benachrichtigungen',
    close: 'Schließen',
    errUnsupported:
      '{name} ist keine unterstützte Arbeitsmappe. Wähle eine .xlsx- oder .xlsm-Datei.',
    errSingleFile: 'Wähle jeweils nur eine Arbeitsmappe aus.',
    errOpenPasswordProtected:
      'Zum Öffnen dieser Datei ist ein Kennwort erforderlich. Dieses Werkzeug entfernt nur den Blatt- oder Arbeitsmappenschutz; ein Öffnungskennwort kann es nicht entfernen.',
    errInvalidWorkbook:
      'Die Datei konnte nicht als XLSX- oder XLSM-Arbeitsmappe gelesen werden. Sie ist möglicherweise beschädigt oder verwendet einen nicht unterstützten Container.',
    errConversionFailed: 'Die Arbeitsmappe konnte nicht verarbeitet werden.',
  },
  es: {
    uploadHeading: 'Selecciona un libro de Excel',
    uploadSubtitle: 'Elige un archivo .xlsx o .xlsm.',
    dropClick: 'Haz clic para elegir un libro',
    dropOr: 'o suéltalo en cualquier parte de la página',
    dropSupported: 'Formatos admitidos: XLSX y XLSM',
    authorization:
      'Utiliza esta herramienta solo con libros propios o que tengas autorización para modificar.',
    scope:
      'Elimina la protección de edición de las hojas y la protección de la estructura del libro. No elimina la contraseña necesaria para abrir el archivo, el cifrado ni la protección de proyectos VBA.',
    processing: 'Revisando y reconstruyendo el libro…',
    resultHeading: 'Resultado',
    sheetsUnlocked: 'Se eliminó la protección de estas hojas: {names}.',
    nameSeparator: ', ',
    workbookUnlocked: 'Se eliminó la protección de la estructura del libro.',
    noProtection:
      'No se encontró protección de hojas ni del libro en este archivo.',
    downloadStarted: 'Ha comenzado la descarga del libro sin protección.',
    downloadAgain: 'Descargar de nuevo',
    notificationsAria: 'Notificaciones',
    close: 'Cerrar',
    errUnsupported:
      '{name} no es un libro compatible. Elige un archivo .xlsx o .xlsm.',
    errSingleFile: 'Selecciona un solo libro cada vez.',
    errOpenPasswordProtected:
      'Este archivo requiere una contraseña para abrirse. La herramienta solo elimina la protección de hojas o del libro; no puede quitar la contraseña de apertura.',
    errInvalidWorkbook:
      'No se pudo leer el archivo como libro XLSX o XLSM. Puede estar dañado o usar un contenedor no compatible.',
    errConversionFailed: 'No se pudo procesar el libro.',
  },
} as const;

type SupportedLocale = keyof typeof copy;
type LocalizedCopy = (typeof copy)[SupportedLocale];

function downloadWorkbook(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ConversionManager({ locale = 'en' }: ConversionManagerProps) {
  const t: LocalizedCopy = copy[locale as SupportedLocale] ?? copy.en;
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<
    (UnlockResult & { inputName: string; outputName: string }) | null
  >(null);
  const [errorToasts, setErrorToasts] = useState<ErrorToastItem[]>([]);

  const showErrorToast = useCallback((message: string) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setErrorToasts((previous) => [...previous, { id, message }]);
  }, []);

  const removeErrorToast = useCallback((id: string) => {
    setErrorToasts((previous) =>
      previous.filter((toast) => toast.id !== id)
    );
  }, []);

  useEffect(() => {
    (globalThis as Record<string, unknown>).__toolReady = true;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setProgress(0);
      setResult(null);

      try {
        const unlockResult = await unlockXlsx(file, ({ completed, total }) => {
          setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
        });
        const outputName = unlockedFileName(file.name);
        const nextResult = {
          ...unlockResult,
          inputName: file.name,
          outputName,
        };
        setResult(nextResult);

        if (unlockResult.protectionsRemoved > 0) {
          downloadWorkbook(unlockResult.blob, outputName);
        }
      } catch (error) {
        showErrorToast(
          `${file.name}: ${resolveErrorMessage(
            error,
            t as unknown as Record<string, string>
          )}`
        );
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [showErrorToast, t]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length !== 1) {
        if (files.length > 0) showErrorToast(t.errSingleFile);
        window.dispatchEvent(new CustomEvent('filesProcessed'));
        return;
      }

      const file = files[0];
      if (!validateFile(file).valid) {
        showErrorToast(t.errUnsupported.replace('{name}', file.name));
        window.dispatchEvent(new CustomEvent('filesProcessed'));
        return;
      }

      void processFile(file).finally(() => {
        window.dispatchEvent(new CustomEvent('filesProcessed'));
      });
    },
    [processFile, showErrorToast, t]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      handleFiles((event as CustomEvent<File[]>).detail);
    };
    window.addEventListener('filesDropped', handler);
    return () => window.removeEventListener('filesDropped', handler);
  }, [handleFiles]);

  return (
    <div>
      <AppCard>
        <div style="margin-bottom: var(--space-4);">
          <h2 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {t.uploadHeading}
          </h2>
          <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {t.uploadSubtitle}
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={t.dropClick}
          style={{
            padding: 'var(--space-6)',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            textAlign: 'center',
            marginBottom: 'var(--space-4)',
            cursor: busy ? 'wait' : 'pointer',
          }}
          onClick={() => {
            if (!busy) document.getElementById('file-input')?.click();
          }}
          onKeyDown={(event) => {
            if (!busy && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              document.getElementById('file-input')?.click();
            }
          }}
        >
          <div style="font-size: 3rem; margin-bottom: var(--space-2);" aria-hidden="true">
            🔓
          </div>
          <div style="font-size: var(--fs-3); font-weight: 600; margin-bottom: var(--space-2);">
            {t.dropClick}
          </div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle);">
            {t.dropOr}
          </div>
          <div style="font-size: var(--fs-1); color: var(--color-subtle); margin-top: var(--space-1);">
            {t.dropSupported}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"
            disabled={busy}
            onChange={(event) => {
              handleFiles(Array.from(event.currentTarget.files || []));
              event.currentTarget.value = '';
            }}
            style="display: none;"
          />
        </div>

        <p style="margin: 0 0 var(--space-2) 0; font-size: var(--fs-2); color: var(--color-subtle);">
          {t.authorization}
        </p>
        <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">
          {t.scope}
        </p>

        {busy && (
          <div
            role="status"
            aria-live="polite"
            style="margin-top: var(--space-4);"
            data-testid="unlock-progress"
          >
            <p style="margin: 0 0 var(--space-2) 0;">{t.processing}</p>
            <progress value={progress} max={100} style="width: 100%;">
              {progress}%
            </progress>
          </div>
        )}

        {result && (
          <div
            data-testid="unlock-result"
            aria-live="polite"
            style="margin-top: var(--space-4); padding: var(--space-4); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm);"
          >
            <h3 style="margin: 0 0 var(--space-2) 0; font-size: var(--fs-3);">
              {t.resultHeading}
            </h3>
            <strong>{result.inputName}</strong>
            {result.protectionsRemoved === 0 ? (
              <p data-testid="no-protection-result">{t.noProtection}</p>
            ) : (
              <>
                {result.protectedSheetNames.length > 0 && (
                  <p data-testid="protected-sheets">
                    {t.sheetsUnlocked.replace(
                      '{names}',
                      result.protectedSheetNames.join(t.nameSeparator)
                    )}
                  </p>
                )}
                {result.workbookProtectionRemoved && (
                  <p data-testid="workbook-protection-result">
                    {t.workbookUnlocked}
                  </p>
                )}
                <p>{t.downloadStarted}</p>
                <AppButton
                  variant="secondary"
                  onClick={() =>
                    downloadWorkbook(result.blob, result.outputName)
                  }
                >
                  {t.downloadAgain}
                </AppButton>
              </>
            )}
          </div>
        )}
      </AppCard>

      {errorToasts.length > 0 && (
        <div
          className="error-toast-container"
          aria-label={t.notificationsAria}
        >
          {errorToasts.map((toast) => (
            <ErrorToast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              onClose={removeErrorToast}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
