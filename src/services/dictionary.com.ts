import axios from 'axios';

import { JSDOM } from 'jsdom';
import { getMonthAndDay, removeAllWhiteSpaceFromString } from '../utils/utils';

import type { GenericWordOfTheDayInterface, OrUndefined } from '../types/custom';

function throwMissingElementError(): never {
  throw new Error('Could not scrap necessary element on Dictionary.com');
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
  if (!wordOfTheDayElement) throwMissingElementError();

  const wordOfTheDayItems = wordOfTheDayElement.querySelector(
    `:first-child > :first-child`
  );
  if (!wordOfTheDayItems) throwMissingElementError();

  const wordOfTheDayExamples = wordOfTheDayElement.querySelector(`div[class*="example"]`);
  if (!wordOfTheDayExamples) throwMissingElementError();

  const wordOfTheDayObject: GenericWordOfTheDayInterface = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    word: wordOfTheDayItems
      .querySelector(`div[class*="__word"] > h1`)
      ?.textContent?.trim() as string,

    pronunciation: wordOfTheDayItems
      .querySelector(`div[class*="__pronunciation"]`)
      ?.textContent?.trim()
      .replace(/[^a-zA-Z-]/g, '') as string,

    partOfSpeech: removeAllWhiteSpaceFromString(
      wordOfTheDayElement.querySelector('div[class*="__pos"]')?.textContent as string
    )[0],

    definitions: [
      removeAllWhiteSpaceFromString(
        wordOfTheDayElement.querySelector('div[class*="__pos"]')?.textContent as string
      )[1],
    ],

    examples: Array.from(wordOfTheDayExamples.querySelectorAll(`p`), elem => '1'),
  };

  return wordOfTheDayObject;
}
