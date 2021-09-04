import path from 'path';
import editJsonFile from 'edit-json-file';
import scrapeFunctionToUse from './scrape';

import { resolveSiteToPartialUrl } from '../utils/constants';
import { dateToUse, siteToScrapeFrom, usePastDate } from '../utils/cliArgs';
import { getDefinition, getExamples, getRelatedWordsFromWordNick } from './wordnick';
import {
  doesStoreExist,
  retrieveWordFromStore,
  retrieveLastWordStoreEntry,
} from '../wordStore/storeApi';

import type { Await, WordStoreInterface, GenericWordOfTheDayInterface } from '../types';

function retrieveWordFromCacheIfPossible(): GenericWordOfTheDayInterface | false {
  const _wordStore = editJsonFile(
    path.resolve(`${path.dirname(path.dirname(__filename))}`, 'wordStore', 'store.json')
  );

  const wordStoreObject = JSON.parse(
    JSON.stringify(_wordStore.toObject())
  ) as WordStoreInterface;

  const todayWordHasBeenCached = Object.prototype.hasOwnProperty.call(
    wordStoreObject,
    dateToUse
  );

  const todaysWordFromSiteAlreadyExists = Object.prototype.hasOwnProperty.call(
    wordStoreObject[dateToUse] ?? {},
    siteToScrapeFrom
  );

  if (todayWordHasBeenCached && todaysWordFromSiteAlreadyExists) {
    const wordOfTheDayObject = retrieveWordFromStore(dateToUse);

    if (wordOfTheDayObject) return wordOfTheDayObject;
  }

  if (usePastDate) throw new Error(`No word entry for date: ${dateToUse}`);
  return false;
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
