# unlock-xlsx implementation status

The stamped engine and content work has been replaced for this tool:

- `src/utils/xlsxUnlockEngine.ts` handles OOXML protection removal with zip.js.
- `src/widgets/ConversionManager.tsx` accepts one XLSX/XLSM workbook and reports
  progress, affected sheet names, workbook protection, and localized errors.
- File validation and the empty settings model are tool-specific.
- English, Japanese, Simplified Chinese, German, and Spanish content is present.
- The PWA manifest and zip.js chunk configuration are tool-specific.
- Unit tests and the generated XLSX fixture cover the engine.
- Playwright conversion coverage uses the XLSX fixture.

Deployment and repository operations are outside this local implementation.
