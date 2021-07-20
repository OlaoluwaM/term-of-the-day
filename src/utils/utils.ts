import type { CorrectDateFormat, RelationshipTypes } from '../types/custom';

function normalizeDate(date: number): string | number {
  return date < 10 ? `0${date}` : date;
}

export function limit<T>(arr: T[], limitTo: number): T[] {
  return arr.slice(0, limitTo);
}

export function getTodaysDateInTheCorrectFormat(
  testDate: number = Date.now()
): CorrectDateFormat {
  // Date should be in the format of yyyy-MM-dd

  const [MM, dd, yyyy] = new Date(testDate).toLocaleDateString('en-US').split('/');
  return `${yyyy}-${normalizeDate(parseInt(MM))}-${normalizeDate(parseInt(dd))}`;
}

export function getMonthAndDay(date = new Date()): string {
  return date.toDateString().split(' ').slice(1, 3).join(' ');
}

export function removeAllWhiteSpaceFromString(str: string): string[] {
  return str
    .trim()
    .split('  ')
    .filter(Boolean)
    .filter(l => !new RegExp(/\n/, 'g').test(l));
}

export function parseRelationship(
  relationship: RelationshipTypes
): 'synonyms' | 'anonyms' {
  const mapObject = {
    equivalent: 'synonyms',
    antonym: 'anonyms',
  } as const;

  return mapObject[relationship];
}
