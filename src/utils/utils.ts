import chalk from 'chalk';
import boxen from 'boxen';

import type { CorrectDateFormat, RelationshipTypes } from '../types';
import type { FalsyValues, GenericWordOfTheDayInterface } from '../types';

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  dimBorder: true,
} as const;

export function isEmptyObject(value: Record<string, unknown>): boolean {
  return JSON.stringify(value) === '{}' ? true : false;
}

export function isEmptyArray(value: unknown[]): boolean {
  return value.length === 0 ? true : false;
}

function normalizeDate(date: number): string | number {
  return date < 10 ? `0${date}` : date;
}

export function limit<T>(arr: T[], limitTo: number): T[] {
  return arr.slice(0, limitTo);
}

export function getTodaysDateInTheCorrectFormat(
  testDate: number | string | Date = Date.now()
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
): 'synonyms' | 'antonyms' {
  const mapObject = {
    equivalent: 'synonyms',
    antonym: 'antonyms',
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

export function stripHTML(wordObj: GenericWordOfTheDayInterface): {
  [key: string]: string | string[];
} {
  return Object.fromEntries(
    Object.entries(wordObj).map(([key, value]: [string, string[] | string]) => {
      let intermitValue = value;

      if (Array.isArray(intermitValue)) {
        intermitValue = intermitValue.map(str => removeHTMLTagChars(str));
      } else intermitValue = removeHTMLTagChars(intermitValue);

      return [key, intermitValue];
    })
  );
}

export function prettifyErrorOutput(errors: Set<string>): void {
  const errorOutput: string[] = [];

  errors.forEach(error => {
    errorOutput.push(chalk.redBright(error));
  });

  if (errorOutput.length === 1) {
    logError(errorOutput[0]);
  } else {
    const errorOutputString: string = errorOutput.join('\n\n').trim();
    console.log(boxen(errorOutputString, boxenOptions));
  }
}

function rearrangeWordOfTheDayObject(
  wordOfTheDayObj: GenericWordOfTheDayInterface
): GenericWordOfTheDayInterface {
  const orderOfProperties = [
    'word',
    'partOfSpeech',
    'pronunciation',
    'definitions',
    'examples',
    'synonyms',
    'antonyms',
    'note',
    'from',
  ] as const;

  return orderOfProperties.reduce((wordObj, property) => {
    const value = wordOfTheDayObj[property];
    if (value) wordObj[property] = value;
    return wordObj;
  }, {} as Record<keyof GenericWordOfTheDayInterface, string | string[] | undefined>) as GenericWordOfTheDayInterface;
}

export function prettifyOutput(wordOfTheDayObj?: GenericWordOfTheDayInterface): void {
  if (!wordOfTheDayObj || isEmptyObject(wordOfTheDayObj as any)) {
    logError('Nothing to log out');
    return;
  }

  const wordOfTheDayString: string = Object.entries(
    rearrangeWordOfTheDayObject(wordOfTheDayObj)
  )
    .map(([key, value]) => {
      let valueOutput: string;

      if (Array.isArray(value)) {
        valueOutput = value
          .map((value: string, index: number, arr: string[]) => {
            const stringWithoutHTML = removeHTMLTagChars(value);

            if (value.startsWith('—')) {
              arr[index - 1].concat(` ${value}`);
              return undefined;
            }

            return `${chalk.white(index + 1)}. ${chalk.green.bold(
              capitalize(stringWithoutHTML)
            )}`;
          })
          .filter(Boolean)
          .join('\n\n');
      } else {
        valueOutput =
          key === 'from'
            ? removeHTMLTagChars(value)
            : capitalize(removeHTMLTagChars(value));
      }

      return `${chalk.whiteBright.bold.underline(capitalize(key))}\n      ${valueOutput}`;
    })
    .join('\n\n');

  console.log(chalk.bgGreen.whiteBright.bold('\nThe Term of The Day'));
  console.log(boxen(wordOfTheDayString, boxenOptions));
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

export function isIntegerOrUndefined(val: number): number | undefined {
  return val >= 0 ? val : undefined;
}

export function valueOrFalse<T>(val: T): false | T {
  return val ? val : false;
}
