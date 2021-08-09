import scrapeDictionaryDotCom from './dictionary.com';

import { doesStoreExist, retrieveRangeOfWordsFromStore } from '../wordStore/storeApi';
import { getDefinition, getExamples, getRelatedWordsFromWordNick } from './wordnick';

import type { GenericWordOfTheDayInterface, Await } from '../types';

export default async function grabWordOfTheDay():
  | Promise<GenericWordOfTheDayInterface>
  | never {
  if (doesStoreExist()) {
    const wordOfTheDayObject = retrieveRangeOfWordsFromStore();

    if (wordOfTheDayObject && !Array.isArray(wordOfTheDayObject)) {
      return wordOfTheDayObject;
    }
  }

  const partialWordOfTheDayObject = await scrapeDictionaryDotCom();
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

  return completeWordOfTheDayObject;
}
