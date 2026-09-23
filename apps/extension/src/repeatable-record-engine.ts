import type {
  ResumeAutofillSnapshotV1,
  ResumeDateValue,
} from './resume-autofill-contract';
import { trackPrefillChange } from './prefill-undo';
import type {
  ClassifiedControl,
  FormSectionKind,
} from './ats-prefill-adapters';

type RepeatableSection = Extract<FormSectionKind, 'experience' | 'education'>;

export interface RepeatableRecord {
  element: HTMLElement;
  section: RepeatableSection;
  recordIndex: number;
}

export interface RepeatableFillOutcome {
  section: RepeatableSection;
  availableRecords: number;
  visibleRecordContainers: number;
  filledFields: number;
  skippedFields: number;
  remainingRecords: number;
}

const RECORD_SELECTOR = [
  'fieldset',
  '[role="group"]',
  '[data-record-index]',
  '[data-automation-id*="experience"]',
  '[data-automation-id*="education"]',
  '[data-testid*="experience"]',
  '[data-testid*="education"]',
].join(',');

/** Visibility is intentionally semantic so zero-size native controls are not guessed at. */
export function isVisibleForRepeatablePrefill(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    if ((current as HTMLElement).hidden) return false;
    if (current.getAttribute('aria-hidden') === 'true') return false;
    const style = (current as HTMLElement).style;
    if (style?.display === 'none' || style?.visibility === 'hidden')
      return false;
    if (
      current.hasAttribute('inert') ||
      current.getAttribute('aria-disabled') === 'true'
    )
      return false;
    const computed =
      current.ownerDocument?.defaultView?.getComputedStyle(current);
    if (
      computed &&
      (computed.display === 'none' ||
        ['hidden', 'collapse'].includes(computed.visibility))
    )
      return false;
    current =
      current.parentElement ||
      ((current.getRootNode?.() as ShadowRoot)?.host ?? null);
  }
  return !(element instanceof HTMLInputElement && element.type === 'hidden');
}

function domOrder(left: Element, right: Element): number {
  if (left === right) return 0;
  const position = left.compareDocumentPosition(right);
  if (position & 4 /* Node.DOCUMENT_POSITION_FOLLOWING */) return -1;
  if (position & 2 /* Node.DOCUMENT_POSITION_PRECEDING */) return 1;
  return 0;
}

/**
 * Find conservative record boundaries. Section classifiers can pass explicit
 * candidates for ATS-specific markup; generic detection considers only native
 * grouping/data markers and never creates missing application rows.
 */
export function detectRepeatableRecordContainers(
  sectionRoot: HTMLElement,
  section: RepeatableSection,
  candidates: readonly HTMLElement[] = Array.from(
    sectionRoot.querySelectorAll<HTMLElement>(RECORD_SELECTOR)
  )
): RepeatableRecord[] {
  const visible = candidates
    .filter(
      (candidate) =>
        candidate !== sectionRoot && isVisibleForRepeatablePrefill(candidate)
    )
    .filter(
      (candidate, _index, all) =>
        !all.some((other) => other !== candidate && other.contains(candidate))
    )
    .sort(domOrder);

  return visible.map((element, recordIndex) => ({
    element,
    section,
    recordIndex,
  }));
}

export function assignControlsToVisibleRecords(
  records: readonly RepeatableRecord[],
  classify: (record: RepeatableRecord) => readonly ClassifiedControl[]
): ClassifiedControl[] {
  return records.flatMap((record) =>
    classify(record).map((control) => ({
      ...control,
      section: record.section,
      recordIndex: record.recordIndex,
    }))
  );
}

function isNativeSafeControl(
  element: ClassifiedControl['element']
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!isVisibleForRepeatablePrefill(element) || element.disabled) return false;
  if (
    element.matches?.(':disabled') ||
    ('readOnly' in element && element.readOnly)
  )
    return false;
  if (element.getAttribute('role') === 'combobox') return false;
  if (element.hasAttribute('aria-autocomplete')) return false;
  if (
    element.closest(
      '[data-custom-datepicker], [data-typeahead], [data-tag-editor]'
    )
  )
    return false;
  if (element instanceof HTMLInputElement) {
    return ['text', 'number', 'month', 'checkbox'].includes(element.type);
  }
  return (
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLSelectElement && !element.multiple)
  );
}

function isEmpty(element: ClassifiedControl['element']): boolean {
  if (
    element instanceof HTMLInputElement &&
    ['checkbox', 'radio'].includes(element.type)
  ) {
    return !element.checked;
  }
  return element.value === '';
}

function monthNames(month: number): string[] {
  const date = new Date(Date.UTC(2020, month - 1, 1));
  return [
    String(month),
    String(month).padStart(2, '0'),
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'UTC',
    }).format(date),
    new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(
      date
    ),
  ];
}

function selectOptionValue(
  select: HTMLSelectElement,
  candidates: readonly string[]
): string | undefined {
  const normalized = new Set(
    candidates.map((value) => value.trim().toLocaleLowerCase('en-US'))
  );
  const options = Array.from(select.options);
  // Labels are authoritative: a month value of "3" can mean April in a
  // zero-based backend. Never fall through to numeric IDs with named months.
  const labels = options.filter((o) =>
    normalized.has((o.label || o.text).trim().toLocaleLowerCase('en-US'))
  );
  const namedMonths = options.some((o) =>
    /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)$/i.test(
      (o.label || o.text).trim()
    )
  );
  const matches = labels.length
    ? labels
    : namedMonths
      ? []
      : options.filter((o) =>
          normalized.has(o.value.trim().toLocaleLowerCase('en-US'))
        );
  const enabled = matches.filter(
    (o) => !o.disabled && !o.closest?.('optgroup[disabled]')
  );
  if (
    enabled.length !== 1 ||
    !enabled[0].value ||
    options.filter((o) => o.value === enabled[0].value).length !== 1
  )
    return undefined;
  return enabled[0].value;
}

function validDate(
  date: ResumeDateValue | undefined
): date is ResumeDateValue & { year: number } {
  if (
    !date ||
    !['month', 'year'].includes(date.precision) ||
    !Number.isInteger(date.year) ||
    date.year! < 1 ||
    date.year! > 9999
  )
    return false;
  return (
    date.precision === 'year' ||
    (Number.isInteger(date.month) && date.month! >= 1 && date.month! <= 12)
  );
}

function wholeDate(
  date: ResumeDateValue | undefined,
  element: ClassifiedControl['element']
): string | undefined {
  if (
    !validDate(date) ||
    date.precision !== 'month' ||
    !(element instanceof HTMLInputElement) ||
    element.type !== 'month'
  )
    return undefined;
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}`;
}

function datePart(
  date: ResumeDateValue | undefined,
  part: 'month' | 'year',
  element: ClassifiedControl['element']
): string | undefined {
  if (!validDate(date)) return undefined;
  if (part === 'month') {
    // A year- or text-precision date must never acquire an invented month.
    if (date.precision !== 'month' || date.month === undefined)
      return undefined;
    const candidates = monthNames(date.month);
    return element instanceof HTMLSelectElement
      ? selectOptionValue(element, candidates)
      : candidates[1];
  }
  if (date.year === undefined || date.precision === 'text') return undefined;
  const value = String(date.year);
  return element instanceof HTMLSelectElement
    ? selectOptionValue(element, [value])
    : value;
}

type Experience = ResumeAutofillSnapshotV1['experience'][number];
type Education = ResumeAutofillSnapshotV1['education'][number];

function valueForControl(
  control: ClassifiedControl,
  record: Experience | Education
): string | boolean | undefined {
  const experience =
    control.section === 'experience' ? (record as Experience) : undefined;
  const education =
    control.section === 'education' ? (record as Education) : undefined;
  switch (control.field) {
    case 'company':
      return experience?.company;
    case 'title':
      return experience?.title;
    case 'school':
      return education?.school;
    case 'degree':
      return education?.degree;
    case 'fieldOfStudy':
      return education?.fieldOfStudy;
    case 'location':
      return record.location;
    case 'description':
      return experience?.descriptionText;
    case 'isCurrent':
      return experience?.isCurrent ? true : undefined;
    case 'startMonth':
      return datePart(record.startDate, 'month', control.element);
    case 'startYear':
      return datePart(record.startDate, 'year', control.element);
    case 'endMonth':
      return datePart(record.endDate, 'month', control.element);
    case 'endYear':
      return datePart(record.endDate, 'year', control.element);
    case 'startDate':
      return wholeDate(record.startDate, control.element);
    case 'endDate':
      return wholeDate(record.endDate, control.element);
    default:
      return undefined;
  }
}

function setNativeValue(
  element: ClassifiedControl['element'],
  value: string | boolean
): boolean {
  if (
    typeof value === 'string' &&
    element instanceof HTMLInputElement &&
    element.ownerDocument
  ) {
    const probe = element.cloneNode(false) as HTMLInputElement;
    probe.value = value;
    if (probe.value !== value || !probe.checkValidity()) return false;
  }
  return trackPrefillChange(element, () => {
    const view = element.ownerDocument?.defaultView;
    const proto =
      element instanceof HTMLSelectElement
        ? view?.HTMLSelectElement.prototype
        : element instanceof HTMLTextAreaElement
          ? view?.HTMLTextAreaElement.prototype
          : view?.HTMLInputElement.prototype;
    if (typeof value === 'boolean') {
      if (
        !(element instanceof HTMLInputElement) ||
        element.type !== 'checkbox' ||
        !value
      )
        return false;
      const setter =
        proto && Object.getOwnPropertyDescriptor(proto, 'checked')?.set;
      if (setter) setter.call(element, true);
      else element.checked = true;
    } else {
      if (!value.trim()) return false;
      const setter =
        proto && Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(element, value);
      else element.value = value;
    }
    const EventCtor = view?.Event || Event;
    element.dispatchEvent(
      new EventCtor('input', { bubbles: true, composed: true })
    );
    element.dispatchEvent(
      new EventCtor('change', { bubbles: true, composed: true })
    );
    return typeof value === 'boolean'
      ? (element as HTMLInputElement).checked === value
      : element.value === value;
  });
}

/** Fill snapshot records into existing visible rows, in stable DOM/display order. */
export function fillRepeatableRecords(
  section: RepeatableSection,
  controls: readonly ClassifiedControl[],
  snapshot: ResumeAutofillSnapshotV1,
  onFieldFilled?: (element: HTMLElement) => void
): RepeatableFillOutcome {
  const sourceRecords =
    section === 'experience' ? snapshot.experience : snapshot.education;
  const eligible = controls
    .filter(
      (control) =>
        control.section === section && control.recordIndex !== undefined
    )
    .sort((left, right) => (left.recordIndex ?? 0) - (right.recordIndex ?? 0));
  const visibleIndices = [
    ...new Set(
      eligible
        .filter((control) => isVisibleForRepeatablePrefill(control.element))
        .map((control) => control.recordIndex as number)
    ),
  ].sort((left, right) => left - right);
  let filledFields = 0;
  let skippedFields = 0;

  for (const control of eligible) {
    const displayedIndex = visibleIndices.indexOf(
      control.recordIndex as number
    );
    const record = sourceRecords[displayedIndex];
    if (
      !record ||
      !isNativeSafeControl(control.element) ||
      !isEmpty(control.element)
    ) {
      skippedFields += 1;
      continue;
    }
    let value = valueForControl(control, record);
    if (
      typeof value === 'string' &&
      control.element instanceof HTMLSelectElement &&
      !/^(start|end)(Month|Year)$/.test(control.field)
    ) {
      value = selectOptionValue(control.element, [value]);
    }
    if (value === undefined || !setNativeValue(control.element, value)) {
      skippedFields += 1;
    } else {
      filledFields += 1;
      onFieldFilled?.(control.element);
    }
  }

  return {
    section,
    availableRecords: sourceRecords.length,
    visibleRecordContainers: visibleIndices.length,
    filledFields,
    skippedFields,
    remainingRecords: Math.max(0, sourceRecords.length - visibleIndices.length),
  };
}

export function remainingRecordsMessage(
  outcome: RepeatableFillOutcome
): string | undefined {
  if (outcome.remainingRecords === 0) return undefined;
  const label =
    outcome.section === 'experience'
      ? 'experience entries'
      : 'education entries';
  return `${outcome.remainingRecords} more ${label} are ready. Add another record manually, then run Prefill again.`;
}
