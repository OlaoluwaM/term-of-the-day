import axios from 'axios';

import { JSDOM } from 'jsdom';
import { getMonthAndDay, removeAllWhiteSpaceFromString } from '../utils/utils';

import type { GenericWordOfTheDayInterface } from '../types';

export function throwMissingElementError(item = ''): never {
  throw new Error(
    `Could not scrape necessary element on Dictionary.com. Item ${item} is missing`
  );
}

export default async function scrapeDictionaryDotCom(): Promise<
  Partial<GenericWordOfTheDayInterface>
> {
  const { data: htmlContent }: { data: string } = await axios.get(
    'https://www.dictionary.com/e/word-of-the-day/'
  );

  const {
    window: { document },
  }: JSDOM = new JSDOM(htmlContent);

  const wordOfTheDayElement = document.querySelector(
    `div[data-date='${getMonthAndDay()}'] > :nth-child(2)`
  );
  if (!wordOfTheDayElement) throwMissingElementError('Word of the day element');

  const wordOfTheDayItems = wordOfTheDayElement.querySelector(
    `:first-child > :first-child`
  );
  if (!wordOfTheDayItems) throwMissingElementError('Word of the day items');

  const wordOfTheDayExamples = wordOfTheDayElement.querySelector(`div[class*="example"]`);
  if (!wordOfTheDayExamples) throwMissingElementError('Necessary examples');

  const wordOfTheDayObject: GenericWordOfTheDayInterface = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    word: wordOfTheDayItems
      .querySelector(`div[class*="__word"] > h1`)
      ?.textContent?.trim() as string,

    pronunciation: wordOfTheDayItems
      .querySelector(`div[class*="__pronunciation"]`)
      ?.textContent?.trim()
      .replace(/[^a-zA-Z-,\s]/g, '') as string,

    partOfSpeech: removeAllWhiteSpaceFromString(
      wordOfTheDayElement.querySelector('div[class*="__pos"]')?.textContent as string
    )[0],

    definitions: [
      removeAllWhiteSpaceFromString(
        wordOfTheDayElement.querySelector('div[class*="__pos"]')?.textContent as string
      )[1],
    ],

    examples: Array.from(
      wordOfTheDayExamples.querySelectorAll(`p`),
      (elem: { textContent: string }) => elem.textContent
    ),

    from: 'dictionary.com',
  };

  return wordOfTheDayObject;
}
