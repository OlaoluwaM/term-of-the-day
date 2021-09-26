import scrapeFunctionToUse from './scrape';

import { resolveSiteToPartialUrl } from '../utils/constants';
import { getDefinition, getExamples, getRelatedWordsFromWordNick } from './wordnick';
import {
  checkIfWordExistsForDate,
  retrieveLastWordStoreEntry,
} from '../wordStore/storeApi';
import { dateToUse, updateWordEntry, siteToScrapeFrom } from '../utils/cliArgs';

import type { Await, GenericWordOfTheDayInterface } from '../types';
import { logError } from '../utils/utils';

function retrieveWordFromCacheIfPossible(): GenericWordOfTheDayInterface | false {
  if (updateWordEntry) return false;

  const wordObj = checkIfWordExistsForDate(dateToUse);

  if (!wordObj || !wordObj?.[siteToScrapeFrom]) {
    // if (usePastDate) throw new Error(`No word entry for date: ${dateToUse}`);
    return false;
  }

  return wordObj[siteToScrapeFrom] as GenericWordOfTheDayInterface;
}

export default async function grabWordOfTheDay():
  | Promise<GenericWordOfTheDayInterface>
  | never {
  let partialWordOfTheDayObject: Partial<GenericWordOfTheDayInterface>;

  const wordObjFromCache = retrieveWordFromCacheIfPossible();

  if (wordObjFromCache) return wordObjFromCache;

  try {
    partialWordOfTheDayObject = await scrapeFunctionToUse();
  } catch (err) {
    logError((err as Error).message);

    partialWordOfTheDayObject = retrieveLastWordStoreEntry();
    partialWordOfTheDayObject.note =
      "Seems like today's word is not out yet, try again later";
  }

  const { word } = partialWordOfTheDayObject;

  const responseArr = await Promise.allSettled([
    getRelatedWordsFromWordNick(word as string, 'equivalent'),
    getRelatedWordsFromWordNick(word as string, 'antonym'),
    getDefinition(word as string),
    getExamples(word as string),
  ]);

  const fulfilledResponses: Await<
    Exclude<typeof responseArr[number], PromiseRejectedResult>['value']
  >[] = (
    responseArr.filter(res => res.status !== 'rejected') as Exclude<
      typeof responseArr[number],
      PromiseRejectedResult
    >[]
  ).map(r => r.value);

  const completeWordOfTheDayObject = fulfilledResponses.reduce(
    (wordOfTheDayObj: typeof partialWordOfTheDayObject, fulfilledValue) => {
      const property = fulfilledValue.type;
      const propertyAlreadyExists = property in partialWordOfTheDayObject;

      if (propertyAlreadyExists) {
        wordOfTheDayObj[property] = fulfilledValue.value
          ? wordOfTheDayObj[property]?.concat(fulfilledValue.value)
          : wordOfTheDayObj[property];
      } else {
        wordOfTheDayObj[property] = fulfilledValue.value ?? undefined;
      }

      return partialWordOfTheDayObject;
    },
    partialWordOfTheDayObject
  ) as GenericWordOfTheDayInterface;

  if (!completeWordOfTheDayObject?.from) {
    completeWordOfTheDayObject.from = resolveSiteToPartialUrl[siteToScrapeFrom];
  }

  return completeWordOfTheDayObject;
}
