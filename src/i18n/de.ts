import type { ToolContent } from './types';

export const de: ToolContent = {
  htmlLang: 'de',

  meta: {
    title: 'Excel-Blattschutz im Browser entfernen | runlocally',
    description:
      'Entferne den Bearbeitungsschutz von Blättern und den Strukturschutz aus einer eigenen XLSX- oder XLSM-Datei. Die Verarbeitung bleibt im Browser; Öffnungskennwörter und Dateiverschlüsselung werden nicht unterstützt.',
    ogTitle: 'Excel-Blatt- und Arbeitsmappenschutz entfernen',
    ogDescription:
      'Entferne Blattschutz und den Strukturschutz einer XLSX- oder XLSM-Arbeitsmappe im Browser. Die Datei wird nicht hochgeladen.',
  },

  hero: {
    h1: 'Excel-Blattschutz entfernen',
    tagline:
      'Entfernt den Bearbeitungsschutz von Blättern und den Strukturschutz aus einer XLSX- oder XLSM-Datei, die du bearbeiten darfst. Kein Upload.',
  },

  intro: {
    h2: 'Was in der Arbeitsmappe geändert wird',
    paras: [
      'XLSX- und XLSM-Dateien sind ZIP-Pakete mit XML-Dateien. Excel speichert den Bearbeitungsschutz eines Blatts in sheetProtection-Elementen und den Strukturschutz der Arbeitsmappe in einem workbookProtection-Element. Das Werkzeug entfernt diese Elemente und schreibt eine neue Arbeitsmappe.',
      'Es stellt kein Kennwort wieder her und probiert keine Kennwörter aus. Zellwerte und der Inhalt anderer Paketeinträge werden nicht geändert. Verwende es nur für Arbeitsmappen, die dir gehören oder die du bearbeiten darfst.',
    ],
  },

  privacy: {
    h2: 'Die Arbeitsmappe bleibt auf deinem Gerät',
    lead:
      'Code im Browser liest und erstellt die Arbeitsmappe neu. Eine serverseitige Konvertierung gibt es nicht.',
    points: [
      'Das XLSX- oder XLSM-Paket wird lokal im Browser geöffnet.',
      'Die statische Seite sendet die Arbeitsmappe nicht an einen Konvertierungsdienst.',
      'Der Quellcode ist unter der MIT-Lizenz verfügbar.',
      'Nach dem Zwischenspeichern der Seite ist die Verarbeitung offline möglich.',
    ],
    note:
      'Im Netzwerkbereich der Browser-Entwicklerwerkzeuge lässt sich das während der Verarbeitung prüfen.',
    sourceLinkText: 'Quellcode ansehen.',
  },

  howto: {
    h2: 'So wird der Schutz entfernt',
    steps: [
      {
        h3: 'Eine Arbeitsmappe auswählen',
        p: 'Wähle eine .xlsx- oder .xlsm-Datei aus oder lege sie auf der Seite ab. Die Datei muss sich bereits ohne Öffnungskennwort öffnen lassen.',
      },
      {
        h3: 'Ergebnis prüfen',
        p: 'Das Werkzeug entfernt sheetProtection und workbookProtection. Es nennt die betroffenen Blätter und meldet den entfernten Strukturschutz gesondert.',
      },
      {
        h3: 'Neue Arbeitsmappe herunterladen',
        p: 'Wenn ein Schutz gefunden wurde, wird eine neue Datei mit der Endung -unlocked.xlsx heruntergeladen. Die Ausgangsdatei wird nicht überschrieben.',
      },
    ],
  },

  faqHeading: 'Häufige Fragen',
  faq: [
    {
      q: 'Wird meine Excel-Datei hochgeladen?',
      a: 'Nein. Die Arbeitsmappe wird im Browser gelesen und neu erstellt. Die Seite hat keinen serverseitigen Konvertierungsdienst; der Quellcode ist einsehbar.',
    },
    {
      q: 'Welche Schutzarten werden entfernt?',
      a: 'Entfernt werden der in sheetProtection gespeicherte Bearbeitungsschutz von Blättern und der in workbookProtection gespeicherte Strukturschutz. Zellinhalte werden nicht bearbeitet.',
    },
    {
      q: 'Kann ein Kennwort zum Öffnen der Datei entfernt werden?',
      a: 'Nein. Eine Datei mit Öffnungskennwort ist ein verschlüsselter CFB-Container und kein offen lesbares OOXML-ZIP-Paket. Dieses Werkzeug kann ihn weder öffnen noch entschlüsseln.',
    },
    {
      q: 'Wird das Blattkennwort geknackt oder angezeigt?',
      a: 'Nein. Das Werkzeug entschlüsselt, rekonstruiert und zeigt kein Kennwort. Es entfernt nur das XML-Schutzelement aus einer bereits lesbaren Arbeitsmappe.',
    },
    {
      q: 'Wird der Schutz eines VBA-Projekts entfernt?',
      a: 'Nein. XLSM-Dateien werden als Eingabe akzeptiert, das VBA-Projekt wird jedoch weder geändert noch entsperrt.',
    },
    {
      q: 'Was geschieht, wenn kein Schutz vorhanden ist?',
      a: 'Die Seite meldet, dass kein Blatt- oder Arbeitsmappenschutz gefunden wurde. Ein Download startet dann nicht.',
    },
    {
      q: 'Funktioniert das Werkzeug offline?',
      a: 'Ja. Die Website ist eine PWA. Nachdem ihre Dateien zwischengespeichert wurden, kann die Arbeitsmappe ohne Netzwerkverbindung verarbeitet werden.',
    },
  ],

  footer: {
    openSourceLabel: 'Open Source (MIT)',
    partOf: 'Teil von',
    brandTail: '— kleine Werkzeuge, die lokal auf deinem Gerät laufen.',
    colophon:
      'Entwickelt und betreut von Geppetto. Teile des Codes entstehen mit KI-Unterstützung; Prüfung und Entscheidungen liegen vollständig beim Maintainer.',
    securityText: 'Sicherheit',
  },

  related: {
    h2: 'Ähnliche Tools',
    blogLinkText: 'Technische Hintergründe lesen',
  },
};
