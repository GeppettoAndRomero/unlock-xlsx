import type { ToolContent } from './types';

export const es: ToolContent = {
  htmlLang: 'es',

  meta: {
    title: 'Quitar la protección de hojas de Excel en el navegador | runlocally',
    description:
      'Quita la protección de edición de hojas y la protección de la estructura de un archivo XLSX o XLSM propio. El proceso se realiza en el navegador; no admite contraseñas de apertura ni archivos cifrados.',
    ogTitle: 'Quitar la protección de hojas y libros de Excel',
    ogDescription:
      'Quita la protección de hojas y de la estructura de un libro XLSX o XLSM en el navegador. El archivo no se sube.',
  },

  hero: {
    h1: 'Quitar la protección de hojas de Excel',
    tagline:
      'Quita la protección de edición de hojas y de la estructura de un XLSX o XLSM que tengas autorización para modificar. El archivo no se sube.',
  },

  intro: {
    h2: 'Qué cambia esta herramienta en el libro',
    paras: [
      'Los archivos XLSX y XLSM son paquetes ZIP que contienen archivos XML. Excel guarda la protección de edición de las hojas en elementos sheetProtection y la protección de la estructura del libro en un elemento workbookProtection. La herramienta elimina esos elementos y genera otro libro.',
      'No recupera contraseñas ni prueba combinaciones. Los valores de las celdas y el contenido de las demás entradas del paquete no se modifican. Úsala solo con libros propios o que tengas permiso para modificar.',
    ],
  },

  privacy: {
    h2: 'El libro permanece en tu dispositivo',
    lead:
      'El código del navegador lee y reconstruye el libro. No hay una conversión en un servidor.',
    points: [
      'El paquete XLSX o XLSM se abre localmente en el navegador.',
      'La página estática no envía el libro a un servicio de conversión.',
      'El código fuente está disponible con licencia MIT.',
      'Una vez almacenada la página en caché, el proceso funciona sin conexión.',
    ],
    note:
      'Puedes comprobar el comportamiento en el panel Red del navegador mientras se procesa el libro.',
    sourceLinkText: 'Ver el código fuente.',
  },

  howto: {
    h2: 'Cómo quitar la protección',
    steps: [
      {
        h3: 'Selecciona un libro',
        p: 'Elige un archivo .xlsx o .xlsm, o suéltalo en la página. El libro debe poder abrirse sin una contraseña de apertura.',
      },
      {
        h3: 'Revisa el resultado',
        p: 'La herramienta elimina sheetProtection y workbookProtection. Muestra los nombres de las hojas afectadas e informa aparte de la protección de la estructura.',
      },
      {
        h3: 'Descarga el nuevo libro',
        p: 'Si encuentra protección, descarga un archivo nuevo cuyo nombre termina en -unlocked.xlsx. El archivo original no se sobrescribe.',
      },
    ],
  },

  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Se sube mi archivo de Excel?',
      a: 'No. El libro se lee y se reconstruye en el navegador. La página no tiene un servicio de conversión en el servidor y el código fuente se puede consultar.',
    },
    {
      q: '¿Qué tipos de protección elimina?',
      a: 'Elimina la protección de edición guardada en elementos sheetProtection y la protección de la estructura guardada en workbookProtection. No edita las celdas.',
    },
    {
      q: '¿Puede quitar la contraseña necesaria para abrir el archivo?',
      a: 'No. Un archivo con contraseña de apertura es un contenedor CFB cifrado, no un paquete ZIP OOXML abierto. La herramienta no puede abrirlo ni descifrarlo.',
    },
    {
      q: '¿Descifra o muestra la contraseña de la hoja?',
      a: 'No. No descifra, recupera ni muestra contraseñas. Solo elimina el elemento XML de protección de un libro que ya se puede abrir.',
    },
    {
      q: '¿Quita la protección de proyectos VBA?',
      a: 'No. Acepta archivos XLSM como entrada, pero no modifica ni desbloquea el proyecto VBA.',
    },
    {
      q: '¿Qué ocurre si el libro no tiene protección?',
      a: 'La página indica que no encontró protección de hojas ni del libro y no inicia ninguna descarga.',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Sí. El sitio es una PWA; cuando sus archivos ya están en caché, puede procesar el libro sin conexión de red.',
    },
  ],

  footer: {
    openSourceLabel: 'Código abierto (MIT)',
    partOf: 'parte de',
    brandTail: '— herramientas pequeñas que se ejecutan localmente en tu dispositivo.',
    colophon:
      'Creado y mantenido por Geppetto. Parte del código se escribe con ayuda de IA; todas las revisiones y decisiones corresponden al responsable del mantenimiento.',
    securityText: 'Seguridad',
  },
};
