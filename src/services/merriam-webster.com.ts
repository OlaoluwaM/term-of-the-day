import axios from 'axios';

import { limit, removeAllWhiteSpaceFromString } from '../utils/utils';
import { JSDOM } from 'jsdom';
import { throwMissingElementError } from './dictionary.com';

import type { GenericWordOfTheDayInterface } from '../types';

export default async function scrapeMerriamWebsterDotCom(): Promise<
  Partial<GenericWordOfTheDayInterface>
> {
  const { data: wordOfTheDayContent }: { data: string } = await axios.get(
    'https://www.merriam-webster.com/word-of-the-day'
  );

  const {
    window: { document },
  }: JSDOM = new JSDOM(wordOfTheDayContent);

  const word = document.querySelector(`div.word-and-pronunciation > h1`).textContent;
  if (!word) throwMissingElementError('word');

  const pronunciation = document.querySelector(`span.word-syllables`).textContent;
  if (!pronunciation) throwMissingElementError('pronunciation element');

  const { data: wordDictionaryEntryContent }: { data: string } = await axios.get(
    `https://www.merriam-webster.com/dictionary/${word}`
  );

  const {
    window: { document: wordEntryDocument },
  }: JSDOM = new JSDOM(wordDictionaryEntryContent);

  if (!wordEntryDocument) throwMissingElementError('word entry');

  const partOfSpeech = wordEntryDocument.querySelector('span.fl')?.textContent;
  if (!partOfSpeech) throwMissingElementError('part of speech element');

  const definitions = limit(
    Array.from(
      wordEntryDocument.querySelectorAll('span.dtText'),
      (elem: { textContent: string }) =>
        elem.textContent.trim().replace(':', '').trimStart()
    ),
    4
  );

  if (!definitions || definitions.length === 0) {
    throwMissingElementError('Definitions');
  }

  const examples = limit(
    Array.from(
      wordEntryDocument.querySelectorAll('span.has-aq'),
      (elem: { textContent: string }) =>
        removeAllWhiteSpaceFromString(elem.textContent.trim()).join('')
    ),
    3
  );

  if (!examples || examples.length === 0) {
    throwMissingElementError('Examples');
  }

  return { word, definitions, partOfSpeech, pronunciation, examples };
}
