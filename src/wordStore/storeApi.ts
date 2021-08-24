import fs from 'fs';
import path from 'path';
import editJsonFile from 'edit-json-file';

import { siteToScrapeFrom, wordShouldBeStored } from './../utils/constants';
import { WordStoreInterface, GenericWordOfTheDayInterface } from '../types';
import { getTodaysDateInTheCorrectFormat, isEmptyArray, stripHTML } from '../utils/utils';

const wordStorePath = path.resolve(__dirname, 'store.json');

export function doesStoreExist(): boolean {
  try {
    fs.accessSync(wordStorePath);
    return true;
  } catch {
    return false;
  }
}

export function createWordStore(): void {
  if (!doesStoreExist()) fs.writeFileSync(wordStorePath, '{}');
}

export function storeWordObject(wordObject: GenericWordOfTheDayInterface): void {
  const wordStore = editJsonFile(wordStorePath, { autosave: true });

  if (!wordShouldBeStored) return;

  wordStore.set(
    `${getTodaysDateInTheCorrectFormat()}.${siteToScrapeFrom}`,
    stripHTML(wordObject)
  );
}

export function retrieveLastWordStoreEntry(): GenericWordOfTheDayInterface {
  const wordStore = editJsonFile(wordStorePath);
  const wordStoreObject = wordStore.toObject() as WordStoreInterface;
  const length = Object.keys(wordStoreObject).length;

  return (
    Object.entries(wordStoreObject)[length - 1][1][siteToScrapeFrom] ??
    Object.entries(wordStoreObject)[length - 1][1]['Merriam Webster']
  );
}

type CustomDateTypes = number | string | Date;

export function retrieveRangeOfWordsFromStore(
  startDate: CustomDateTypes = Date.now(),
  endDate: CustomDateTypes = Date.now()
): GenericWordOfTheDayInterface[] | null {
  const wordStore = editJsonFile(wordStorePath);
  const wordStoreObject = wordStore.toObject() as WordStoreInterface;

  let startDateInMilliseconds = new Date(startDate).getTime();
  let endDateInMilliseconds = new Date(endDate).getTime();

  if (endDateInMilliseconds < startDateInMilliseconds) {
    startDateInMilliseconds = endDateInMilliseconds;
    endDateInMilliseconds = startDateInMilliseconds;
  }

  if (startDateInMilliseconds === endDateInMilliseconds) {
    return [retrieveLastWordStoreEntry()];
  }

  const rangeQueryValue = Object.entries(wordStoreObject)
    .filter(({ '0': date }) => {
      const dateInMilliseconds = new Date(date).getTime();

      return (
        dateInMilliseconds >= startDateInMilliseconds &&
        dateInMilliseconds <= endDateInMilliseconds
      );
    })
    .map(({ 1: wordObjects }) => wordObjects[siteToScrapeFrom])
    .filter(Boolean) as GenericWordOfTheDayInterface[];

  return isEmptyArray(rangeQueryValue) ? null : rangeQueryValue;
}

export function retrieveAllWordsFromStore(): GenericWordOfTheDayInterface[] {
  const wordStore = editJsonFile(wordStorePath);
  const wordStoreObj = wordStore.toObject() as WordStoreInterface;

  return Object.entries(wordStoreObj).map(
    ({ 1: wordObj }) => wordObj[siteToScrapeFrom] ?? wordObj['Merriam Webster']
  );
}
