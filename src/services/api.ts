import { GenericWordOfTheDayInterface } from '../types/custom';
import scrapeDictionaryDotCom from './dictionary.com';
import { getDefinition, getExamples, getRelatedWordsFromWordNick } from './wordnick';

export default async function grabWordOfTheDay(): Promise<GenericWordOfTheDayInterface> {
  const partialWordOfTheDayObject = await scrapeDictionaryDotCom();
  const { word } = partialWordOfTheDayObject;

  const responseArr = await Promise.allSettled([
    getRelatedWordsFromWordNick(word as string, 'equivalent'),
    getRelatedWordsFromWordNick(word as string, 'antonym'),
    getDefinition(word as string),
    getExamples(word as string),
  ]);

  const response: PromiseFulfilledResult = responseArr.find(
    res => res.status === 'fulfilled'
  );
  responseArr.forEach((response: any) => {
    if (response.status === 'rejected') return;
    if (!('value' in response)) return;

    const propertyExists =
      (response.value?.type as keyof GenericWordOfTheDayInterface) in
      partialWordOfTheDayObject;

    if (!propertyExists) {
      partialWordOfTheDayObject[response.value.type] = response.value.value;
    } else {
      partialWordOfTheDayObject[response.value.type].concat(response.value.value);
    }
  });

  return partialWordOfTheDayObject;
}

console.log(grabWordOfTheDay());
