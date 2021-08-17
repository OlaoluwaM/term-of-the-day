import path from 'path';
import editJsonFile from 'edit-json-file';
import scrapeFunctionToUse from './scrape';

import { SiteOptions, siteArgument } from '../utils/constants';
import { getTodaysDateInTheCorrectFormat } from '../utils/utils';
import { getDefinition, getExamples, getRelatedWordsFromWordNick } from './wordnick';
import {
  doesStoreExist,
  retrieveLastWordStoreEntry,
  retrieveRangeOfWordsFromStore,
} from '../wordStore/storeApi';

import type {
  Await,
  WordStoreInterface,
  PossibleScriptParameters,
  GenericWordOfTheDayInterface,
} from '../types';

const siteWordOfTheDayIsFrom = SiteOptions[siteArgument as PossibleScriptParameters];

function retrieveWordFromCacheIfPossible(): GenericWordOfTheDayInterface | false {
  const _wordStore = editJsonFile(
    path.resolve(`${path.dirname(path.dirname(__filename))}`, 'wordStore', 'store.json')
  );

  const wordStoreObject = JSON.parse(
    JSON.stringify(_wordStore.toObject())
  ) as WordStoreInterface;

  const todayDate = getTodaysDateInTheCorrectFormat();
  const storeExists: boolean = doesStoreExist();

  const todayWordHasBeenCached = Object.prototype.hasOwnProperty.call(
    wordStoreObject,
    todayDate
  );

  const alreadyScrapedFromSite: boolean =
    wordStoreObject[todayDate]?.from === siteWordOfTheDayIsFrom;

  if (storeExists && todayWordHasBeenCached && alreadyScrapedFromSite) {
    const wordOfTheDayObject = retrieveRangeOfWordsFromStore(todayDate);

    if (wordOfTheDayObject) return wordOfTheDayObject[0];
  }

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
    completeWordOfTheDayObject.from = siteWordOfTheDayIsFrom;
  }

  return completeWordOfTheDayObject;
}
