import axios from 'axios';

import { JSDOM } from 'jsdom';
import { throwMissingElementError } from './dictionary.com';
import {
  limit,
  removeAllWhiteSpaceFromString,
  getTodaysDateInTheCorrectFormat,
} from '../utils/utils';

import type { CorrectDateFormat, GenericWordOfTheDayInterface } from '../types';
import { dateToUse, usePastDate } from '../utils/cliArgs';

function generateUrl(
  date: CorrectDateFormat = getTodaysDateInTheCorrectFormat()
): string {
  const returnValue = 'https://www.merriam-webster.com/word-of-the-day';
  if (usePastDate) return returnValue.concat(`/test-${date}`);
  return returnValue;
}

function scrapeRelatedAndOppositeWords(document: any): {
  synonyms?: string[];
  antonyms?: string[];
} {
  type Labels = 'Synonyms' | 'Antonyms';

  const labels = Array.from(
    document.querySelectorAll('.function-label') ?? { length: 0 },
    (elem: { textContent: Labels }) => {
      return elem?.textContent;
    }
  ).filter(label => label.search(/Synonyms|Antonyms/i) > -1);

  switch (labels.length) {
    case 1:
      return {
        [labels[0].toLocaleLowerCase()]: limit(
          Array.from(
            document.querySelectorAll(`p.function-label:first-of-type + ul > li > a`),
            (elem: { textContent: string }) =>
              removeAllWhiteSpaceFromString(elem?.textContent.trim()).join('')
          ),
          8
        ).filter(Boolean),
      };

    case 2:
      return {
        [labels[0].toLocaleLowerCase()]: limit(
          Array.from(
            document.querySelectorAll(`p.function-label:first-of-type + ul > li > a`),
            (elem: { textContent: string }) =>
              removeAllWhiteSpaceFromString(elem?.textContent.trim()).join('')
          ),
          8
        ).filter(Boolean),

        [labels[1].toLocaleLowerCase()]: limit(
          Array.from(
            document.querySelectorAll(`p.function-label:last-of-type + ul > li > a`) ?? {
              length: 0,
            },
            (elem: { textContent: string }) =>
              removeAllWhiteSpaceFromString(elem?.textContent.trim()).join('')
          ),
          8
        ).filter(Boolean),
      };

    default:
      return { synonyms: [], antonyms: [] };
  }
}

export default async function scrapeMerriamWebsterDotCom(): Promise<
  Partial<GenericWordOfTheDayInterface>
> {
  const { data: wordOfTheDayContent }: { data: string } = await axios.get(
    generateUrl(dateToUse)
  );

  const {
    window: { document },
  }: JSDOM = new JSDOM(wordOfTheDayContent);

  const dateOnPage = document
    .querySelector('span.w-a-title')
    .textContent.split(': ')[1]
    .trim() as string;

  const dateOnPageInCorrectFormat = getTodaysDateInTheCorrectFormat(new Date(dateOnPage));

  if (dateOnPageInCorrectFormat !== dateToUse) throw new Error("Not today's word");

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

  const exampleSet1 = limit(
    Array.from(
      wordEntryDocument.querySelectorAll('div.in-sentences span.ex-sent'),
      (elem: { textContent: string }) =>
        removeAllWhiteSpaceFromString(elem?.textContent.trim()).join('')
    ),
    5
  ).filter(example => !example.startsWith('—'));

  const examplesSet2 = limit(
    Array.from(
      wordEntryDocument.querySelectorAll('span.t'),
      (elem: { textContent: string }) =>
        removeAllWhiteSpaceFromString(elem?.textContent.trim()).join('')
    ),
    5
  ).filter(example => !exampleSet1.includes(example));

  const examples = exampleSet1.concat(examplesSet2).filter(Boolean);

  if (!examples || examples.length === 0) {
    throwMissingElementError('Examples');
  }

  const relatedWordsObject = scrapeRelatedAndOppositeWords(wordEntryDocument);

  return {
    word,
    definitions,
    partOfSpeech,
    pronunciation,
    examples,
    ...relatedWordsObject,
    from: 'merriam-webster.com',
  };
}
