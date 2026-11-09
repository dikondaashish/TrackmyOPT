import { defineArticle, source } from './shared';
import type { ArticleSource } from './types';

// Spanish OPT processing-time guide (test of Spanish search demand). Community
// figures are the November 8, 2026 snapshot published in
// community-timelines-november-2026.ts. Fees, the premium clock and the
// processing-times method were checked on uscis.gov on November 9, 2026.

const SLUG = 'tiempo-de-procesamiento-opt-2026';
const EN_SLUG = 'opt-processing-time-2026';

const processingTimes: ArticleSource = {
  label: 'Check Case Processing Times',
  publisher: 'USCIS',
  url: 'https://egov.uscis.gov/processing-times/',
};

const processingTimesInfo: ArticleSource = {
  label: 'Processing Times: More Information',
  publisher: 'USCIS',
  url: 'https://egov.uscis.gov/processing-times/more-info',
};

const premiumHowTo: ArticleSource = {
  label: 'How Do I Request Premium Processing?',
  publisher: 'USCIS',
  url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
};

const feeSchedule: ArticleSource = {
  label: 'G-1055, Fee Schedule (edition 10/26/26)',
  publisher: 'USCIS',
  url: 'https://www.uscis.gov/g-1055',
};

const i765Page: ArticleSource = {
  label: 'I-765, Application for Employment Authorization',
  publisher: 'USCIS',
  url: 'https://www.uscis.gov/i-765',
};

const communityMethod: ArticleSource = {
  label: 'TrackMyOPT community timeline methodology',
  publisher: 'TrackMyOPT',
  url: 'https://www.trackmyopt.com/features/community',
};

export const optProcessingTimeEs = defineArticle({
  slug: SLUG,
  lang: 'es',
  translations: { en: EN_SLUG },
  title:
    'Tiempo de procesamiento de OPT en 2026: cuánto tarda el EAD y cómo leer la herramienta de USCIS',
  seoTitle: 'Tiempo de procesamiento OPT 2026: cuánto tarda el EAD',
  description:
    'Cuánto tarda la aprobación de OPT y STEM OPT en 2026: cómo leer la herramienta oficial de USCIS, lo que reporta la comunidad (mediana de 125 días), premium processing y qué hacer mientras esperas.',
  category: 'Tiempos de procesamiento',
  tags: [
    'tiempo de procesamiento OPT 2026',
    'cuánto tarda OPT',
    'EAD OPT',
    'Formulario I-765',
    'premium processing',
    'STEM OPT',
  ],
  readTime: '7 min de lectura',
  publishedDate: '2026-10-29',
  modifiedDate: '2026-11-09',
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'Portada de TrackMyOPT: tiempo de procesamiento de OPT en 2026 con las medianas de la comunidad para OPT inicial y STEM OPT.',
  imageCaption:
    'Portada generada con las cifras de la comunidad del 8 de noviembre de 2026. Datos de usuarios, no de USCIS.',
  reviewLabel: 'Revisado con uscis.gov el 9 de noviembre de 2026',
  showContents: true,
  directAnswer:
    'No hay un plazo único para aprobar OPT. USCIS publica su propia estimación en la herramienta de tiempos de procesamiento: elige el Formulario I-765, tu categoría de OPT y la oficina que lleva tu caso. Como referencia, el 8 de noviembre de 2026 la comunidad de TrackMyOPT reportaba una mediana de 125 días desde el recibo hasta la aprobación para OPT inicial sin premium (1,546 casos; la mitad central entre 90 y 143 días) y de 183 días para STEM OPT (585 casos; entre 124 y 186 días). Con premium processing (Formulario I-907, $1,780) USCIS debe actuar en 30 días hábiles, lo que no garantiza la aprobación ni la tarjeta.',
  keyTakeaways: [
    'La cifra oficial está en la herramienta de USCIS: muestra cuánto tardó USCIS en completar el 80% de los casos en los últimos seis meses.',
    'Comunidad TrackMyOPT, 8 de noviembre de 2026: OPT inicial, mediana de 125 días (1,546 casos); STEM OPT, mediana de 183 días (585 casos). No son datos de USCIS.',
    'Premium processing para OPT y STEM OPT cuesta $1,780 según el G-1055 vigente y obliga a USCIS a actuar en 30 días hábiles. Actuar puede ser aprobar, negar, enviar un aviso de intención de negar o pedir evidencia.',
    'La aprobación y la tarjeta son pasos distintos. Con OPT post-completion no puedes empezar a trabajar sin el EAD y antes de la fecha de inicio autorizada.',
  ],
  sections: [
    {
      heading: 'Qué significa "tiempo de procesamiento" de OPT',
      paragraphs: [
        'Para OPT se presenta el Formulario I-765, la solicitud de permiso de trabajo. Cuando USCIS la acepta, te envía un aviso de recibo con tu receipt number (número de recibo, tres letras y diez dígitos). El tiempo de procesamiento es el tiempo entre la fecha de ese recibo y la decisión de USCIS: aprobación o negación.',
        'La tarjeta EAD (Employment Authorization Document, el documento de autorización de empleo) llega después. En su página de premium processing, USCIS indica que la tarjeta debería producirse unas dos semanas después de aprobarse el I-765 y pide esperar 30 días desde la aprobación antes de preguntar por ella. La producción y el envío por correo son etapas aparte.',
      ],
      table: {
        caption: 'Las etapas de un caso de OPT y qué controla cada una.',
        columns: ['Etapa', 'Qué la marca', 'Dónde la ves'],
        rows: [
          ['Recibo', 'USCIS acepta el I-765 y asigna el receipt number', 'Aviso de recibo (I-797C) y tu cuenta de USCIS'],
          ['Revisión', 'USCIS estudia el caso; puede pedir biometría o evidencia (RFE)', 'Avisos en tu cuenta y por correo'],
          ['Decisión', 'Aprobación o negación', 'Estado del caso en línea'],
          ['Tarjeta', 'Producción del EAD y envío por correo', 'Estado del caso y seguimiento postal cuando aparece'],
        ],
      },
      sources: [premiumHowTo, source.opt],
    },
    {
      heading: 'Cómo leer la herramienta oficial de USCIS',
      paragraphs: [
        'La herramienta Check Case Processing Times es la referencia oficial. Elige el Formulario I-765, la categoría de estudiante F-1 y la oficina que tramita tu caso. El I-765 cubre muchas categorías con tiempos distintos, así que un promedio general del formulario no sirve para OPT.',
        'USCIS explica que la cifra mostrada es el tiempo que tardó en completar el 80% de los casos decididos en los últimos seis meses. No es un plazo que USCIS te deba. La misma página calcula una fecha de consulta (case inquiry date) a partir del tiempo en que se completó el 93% de los casos: si tu recibo es anterior a esa fecha, puedes pedir información sobre un caso fuera del tiempo normal.',
      ],
      bullets: [
        'En tu I-765, OPT antes de terminar estudios es la categoría (c)(3)(A).',
        'OPT después de terminar estudios (post-completion) es la categoría (c)(3)(B).',
        'La extensión STEM OPT de 24 meses es la categoría (c)(3)(C).',
        'En la herramienta, las tres aparecen juntas como "Based on a request by a qualified F-1 academic student [(c)(3)]".',
      ],
      note: 'Revisa la herramienta cada mes. La cifra se recalcula y puede subir o bajar aunque tu caso no haya cambiado.',
      sources: [processingTimes, processingTimesInfo],
    },
    {
      heading: 'Lo que reporta la comunidad: foto del 8 de noviembre de 2026',
      paragraphs: [
        'TrackMyOPT reúne cada día cronologías anónimas de casos reales, publicadas en foros y en trackers asociados. Guarda las fechas y el tipo de caso, y descarta nombres y números de recibo. Estas son las cifras del corte del 8 de noviembre de 2026 para casos completados sin premium processing, contadas en días calendario desde el recibo hasta la aprobación.',
      ],
      table: {
        caption: 'Casos completados sin premium processing, comunidad TrackMyOPT, 8 de noviembre de 2026. No son datos de USCIS.',
        columns: ['Tipo de caso', 'Casos completados', 'Mediana (días)', 'Mitad central (días)'],
        rows: [
          ['OPT inicial (post-completion)', '1,546', '125', '90 a 143'],
          ['Extensión STEM OPT', '585', '183', '124 a 186'],
        ],
      },
      bullets: [
        'La mitad central es el rango más útil: la mitad de los casos de OPT inicial terminó entre el día 90 y el día 143.',
        'Son datos reportados por usuarios, mezclados entre meses de recibo. Sirven para planear, no para predecir tu caso.',
        'Compara tu caso con el mismo tipo de caso y sin premium processing.',
      ],
      links: [
        { label: 'Estima tu ventana de decisión de OPT (en inglés)', href: '/tools/opt-decision-window' },
      ],
      sources: [communityMethod],
    },
    {
      heading: 'Premium processing para OPT y STEM OPT',
      paragraphs: [
        'Premium processing (procesamiento prioritario) se pide con el Formulario I-907. Está disponible para el I-765 en las categorías (c)(3)(A), (c)(3)(B) y (c)(3)(C). Puedes pedirlo junto con el I-765 o después, para un caso que ya está pendiente.',
        'USCIS debe actuar sobre tu caso en 30 días hábiles desde que recibe un I-907 bien presentado. Puede aprobarlo, negarlo, enviar un aviso de intención de negar, pedir evidencia (RFE) o abrir una investigación por fraude. Cuando USCIS recibe tu respuesta a una RFE o a un aviso de intención de negar, empieza un nuevo plazo de 30 días hábiles. No garantiza la aprobación ni que la tarjeta llegue en ese plazo.',
      ],
      table: {
        caption: 'Tarifas vigentes según el G-1055 de USCIS, edición 10/26/26. Confirma la tarifa el día que pagues.',
        columns: ['Concepto', 'En papel', 'En línea'],
        rows: [
          ['Formulario I-765 (tarifa general)', '$520', '$470'],
          ['Formulario I-907 para OPT y STEM OPT', '$1,780', '$1,780'],
        ],
      },
      note: 'La tarifa del I-907 se paga aparte de la del I-765. Si mandas un solo pago para formularios presentados juntos, USCIS puede rechazarlos.',
      sources: [source.pp, premiumHowTo, feeSchedule],
    },
    {
      heading: 'Qué hacer mientras esperas',
      paragraphs: [
        'Con OPT post-completion no puedes empezar a trabajar hasta tener el EAD en la mano y haber llegado a la fecha de inicio que aparece en la tarjeta. Usa la espera para dejar todo listo.',
      ],
      numbered: [
        'Guarda tu receipt number y la fecha del recibo. Son los datos que piden la herramienta de USCIS y cualquier consulta.',
        'Mantén tu dirección al día con USCIS y revisa tu cuenta en línea por si llega una cita de biometría o una RFE.',
        'Calcula tu fecha de consulta en la herramienta de USCIS y no pidas información antes de esa fecha.',
        'Habla con tu DSO (el responsable de estudiantes internacionales de tu escuela) si la fecha de inicio que pediste se acerca y el caso sigue pendiente.',
        'Si piensas pedir premium processing, compara su costo con lo que te cuesta un inicio de trabajo retrasado.',
      ],
      note: 'Sobre la regla de "fixed time period of admission": un tribunal federal pospuso su entrada en vigor el 14 de septiembre de 2026. USCIS sigue aplicando las reglas anteriores y acepta la edición 08/21/25 del Formulario I-765.',
      links: [
        { label: 'Estado de la tarjeta EAD: qué significa cada mensaje (en inglés)', href: '/blog/ead-card-status-check' },
        { label: 'OPT processing time 2026 (en inglés)', href: `/blog/${EN_SLUG}` },
      ],
      sources: [i765Page, source.sevpEmployment],
    },
    {
      heading: 'Más guías en español',
      paragraphs: [
        'Si además tienes un proceso de residencia permanente, el Boletín de visas sigue un calendario distinto al de tu EAD. Lo explicamos en español con las tablas oficiales de octubre y noviembre.',
      ],
      links: [
        { label: 'Boletín de visas de diciembre 2026: predicciones', href: '/blog/boletin-de-visas-diciembre-2026-predicciones' },
      ],
    },
  ],
  checklist: [
    'Anota tu receipt number, la fecha del recibo y la categoría de tu I-765.',
    'Revisa la herramienta de USCIS con el formulario, la categoría y la oficina correctas.',
    'Compara tu caso con la mitad central de la comunidad, no solo con la mediana.',
    'Confirma la tarifa del I-907 en el G-1055 antes de pagar premium processing.',
    'No empieces a trabajar sin el EAD y antes de la fecha de inicio autorizada.',
  ],
  mistakes: [
    'Tomar la estimación de USCIS como una fecha garantizada.',
    'Comparar un caso con premium processing con la mediana de casos sin premium.',
    'Confundir la fecha de aprobación con la fecha en que llega la tarjeta.',
    'Pedir información a USCIS antes de la fecha de consulta que da la herramienta.',
  ],
  faq: [
    {
      question: '¿Cuánto tarda OPT en 2026?',
      answer:
        'Depende de la categoría, la oficina y la carga de trabajo. La cifra oficial está en la herramienta de tiempos de procesamiento de USCIS. Como referencia, la comunidad de TrackMyOPT reportaba el 8 de noviembre de 2026 una mediana de 125 días para OPT inicial sin premium, con la mitad central entre 90 y 143 días.',
    },
    {
      question: '¿Cuánto tarda STEM OPT?',
      answer:
        'En la misma foto del 8 de noviembre de 2026, la mediana de la comunidad para la extensión STEM OPT sin premium fue de 183 días (585 casos), con la mitad central entre 124 y 186 días. Revisa también la herramienta de USCIS con la categoría (c)(3)(C).',
    },
    {
      question: '¿Cuánto cuesta premium processing para OPT?',
      answer:
        'Según el G-1055 de USCIS, edición 10/26/26, el Formulario I-907 para OPT y STEM OPT cuesta $1,780, en papel o en línea, además de la tarifa del I-765. USCIS debe actuar en 30 días hábiles.',
    },
    {
      question: '¿Puedo trabajar mientras mi OPT está pendiente?',
      answer:
        'Con OPT post-completion, no. Necesitas el EAD y que haya llegado la fecha de inicio autorizada. La extensión STEM OPT tiene reglas propias si la presentaste a tiempo; confírmalas con tu DSO.',
    },
    {
      question: '¿Cuándo puedo preguntar a USCIS por mi caso?',
      answer:
        'Cuando tu fecha de recibo sea anterior a la fecha de consulta (case inquiry date) que muestra la herramienta de USCIS para tu formulario, categoría y oficina.',
    },
  ],
  dataNote:
    'Las cifras de la comunidad son de la foto del 8 de noviembre de 2026: casos completados sin premium processing, en días calendario desde la fecha de recibo hasta la fecha de aprobación reportadas por usuarios. Son datos anónimos y autorreportados, no datos de USCIS, y no describen ningún caso individual. Información general, no asesoría legal.',
  sources: [processingTimes, processingTimesInfo, source.pp, premiumHowTo, feeSchedule, i765Page, source.opt],
  related: [
    { label: 'OPT processing time 2026 (versión en inglés)', href: `/blog/${EN_SLUG}` },
    { label: 'STEM OPT processing time 2026 (en inglés)', href: '/blog/stem-opt-processing-time-2026' },
    { label: 'Estado de la tarjeta EAD (en inglés)', href: '/blog/ead-card-status-check' },
    { label: 'Boletín de visas de diciembre 2026: predicciones', href: '/blog/boletin-de-visas-diciembre-2026-predicciones' },
  ],
});
