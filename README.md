# unlock-xlsx

Remove sheet editing protection and workbook structure protection from an XLSX
or XLSM workbook in the browser. Files are processed on the device and are not
uploaded.

Use this tool only with workbooks you own or are authorized to modify.

Part of [runlocally](https://runlocally.app) — small tools that run locally on
your device.

## How it works

XLSX and XLSM files are OOXML ZIP packages. The tool uses
[`@zip.js/zip.js`](https://gildas-lormeau.github.io/zip.js/) to read the
package, removes `sheetProtection` elements from worksheet XML and
`workbookProtection` elements from `xl/workbook.xml`, then writes a new
workbook. Other package entries are copied without changing their content.

This is not password recovery. It does not remove a password required to open
an encrypted file, and it does not modify VBA project protection.

## Develop

```bash
npm run dev
npm run type-check
npm run lint
npm run test:unit
npm run build
```

Stack: Astro, Preact, TypeScript, and zip.js.

## License

[MIT](./LICENSE). Built and maintained by Geppetto. Some code is written with
AI assistance; all review and decisions are the maintainer's.
