import type { ToolContent } from './types';

export const en: ToolContent = {
  htmlLang: 'en',

  meta: {
    title: 'Remove Excel Sheet Protection in Your Browser | runlocally',
    description:
      'Remove sheet editing protection and workbook structure protection from your own XLSX or XLSM file. Processing stays in your browser; opening passwords and file encryption are not supported.',
    ogTitle: 'Remove Excel Sheet and Workbook Protection',
    ogDescription:
      'Remove sheet editing locks and workbook structure protection from an XLSX or XLSM file in your browser. The file is not uploaded.',
  },

  hero: {
    h1: 'Remove Excel Sheet Protection',
    tagline:
      'Remove sheet editing locks and workbook structure protection from an XLSX or XLSM file you are authorized to modify. Nothing is uploaded.',
  },

  intro: {
    h2: 'What this Excel protection remover changes',
    paras: [
      'An XLSX or XLSM workbook is a ZIP package containing XML files. Excel records sheet editing protection in sheetProtection elements and workbook structure protection in a workbookProtection element. This tool removes those elements and writes a new workbook.',
      'It does not recover a password or try password combinations. Cell values and other package entries are copied without changing their content. Use it only for a workbook you own or have permission to modify.',
    ],
  },

  privacy: {
    h2: 'The workbook stays on your device',
    lead:
      'The workbook is read and rebuilt by code running in the browser. There is no server-side conversion step:',
    points: [
      'The XLSX or XLSM package is opened locally in the browser.',
      'The static page does not send the workbook to a conversion service.',
      'The source code is available under the MIT License.',
      'After the page has been cached, the tool can run offline.',
    ],
    note:
      'You can verify the behavior in the browser Network panel while processing a workbook.',
    sourceLinkText: 'Read the source.',
  },

  howto: {
    h2: 'How to remove the protection',
    steps: [
      {
        h3: 'Choose one workbook',
        p: 'Select an .xlsx or .xlsm file, or drop it on the page. The workbook must already be openable without an opening password.',
      },
      {
        h3: 'Review the result',
        p: 'The tool removes sheetProtection and workbookProtection elements. It lists the sheet names whose protection was removed and reports workbook structure protection separately.',
      },
      {
        h3: 'Download the new workbook',
        p: 'When protection is found, the rebuilt workbook downloads as a file ending in -unlocked.xlsx. The original file is not overwritten.',
      },
    ],
  },

  faqHeading: 'FAQ',
  faq: [
    {
      q: 'Is my Excel file uploaded?',
      a: 'No. The workbook is read and rebuilt in your browser. The page has no server-side conversion endpoint, and the source code is available for inspection.',
    },
    {
      q: 'What kinds of Excel protection does this remove?',
      a: 'It removes sheet editing protection stored in sheetProtection elements and workbook structure protection stored in a workbookProtection element. It does not edit cell contents.',
    },
    {
      q: 'Can it remove a password required to open the file?',
      a: 'No. A file protected by an opening password is an encrypted CFB container rather than an open OOXML ZIP package. This tool cannot open or decrypt that container.',
    },
    {
      q: 'Does it crack or reveal the sheet password?',
      a: 'No. It does not decrypt, recover, or display a password. It removes the XML protection element from an already-openable workbook.',
    },
    {
      q: 'Does it remove VBA project protection?',
      a: 'No. VBA project protection is outside this tool’s scope. The tool accepts XLSM input but does not modify or unlock the VBA project.',
    },
    {
      q: 'What happens if the workbook has no protection?',
      a: 'The result states that no sheet or workbook protection was found. No download starts in that case.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. The site is a PWA; after its files have been cached, workbook processing can run without a network connection.',
    },
  ],

  footer: {
    openSourceLabel: 'Open source (MIT)',
    partOf: 'part of',
    brandTail: '— small tools that run locally on your device.',
    colophon:
      "Built and maintained by Geppetto. Some code is written with AI assistance; all review and decisions are the maintainer's.",
    securityText: 'Security',
  },

  related: {
    h2: 'Related tools',
    blogLinkText: 'Read the technical notes',
  },
};
