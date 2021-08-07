import chalk from 'chalk';
import boxen from 'boxen';

import type { CorrectDateFormat, RelationshipTypes } from '../types';
import type { FalsyValues, GenericWordOfTheDayInterface } from '../types';

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

export function stripFalsyValuesFromProperties(
  obj: Record<string, unknown | FalsyValues> | GenericWordOfTheDayInterface
): Record<string, unknown> | GenericWordOfTheDayInterface {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]): [string, unknown] => {
        if (Array.isArray(value)) return [key, value.filter(Boolean)];
        if (!value) [key, undefined];
        return [key, value];
      })
      .filter(arr => Boolean(arr[1]))
  );
}

function capitalize(str: string): string {
  return str.replace(str[0], str[0].toLocaleUpperCase());
}

function removeHTMLTagChars(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export function prettifyOutput(wordOfTheDayObj?: GenericWordOfTheDayInterface): void {
  if (!wordOfTheDayObj) {
    logError('Nothing to log out');
    return;
  }

  const wordOfTheDayString: string = Object.entries(wordOfTheDayObj)
    .map(([key, value]) => {
      let valueOutput: string;

      if (Array.isArray(value)) {
        valueOutput = value
          .map(
            (value: string, index: number) =>
              `${chalk.white(index + 1)}. ${chalk.green.bold(
                capitalize(removeHTMLTagChars(value))
              )}`
          )
          .join('\n\n');
      } else valueOutput = capitalize(removeHTMLTagChars(value));

      return `${chalk.whiteBright.bold.underline(capitalize(key))}\n      ${valueOutput}`;
    })
    .join('\n\n');

  console.log(chalk.white.underline('\nThe Term of The Day'));
  console.log(
    boxen(wordOfTheDayString, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      dimBorder: true,
    })
  );
}

export function logInfo(string: string): void {
  console.log(chalk.blue.bold(string));
}

export function logError(string: string): void {
  console.log(chalk.red.red(string));
}

export function logSuccess(string: string): void {
  console.log(chalk.green.bold(string));
}
