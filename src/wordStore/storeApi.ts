import fs from 'fs';
import path from 'path';
import editJsonFile from 'edit-json-file';
import { getTodaysDateInTheCorrectFormat, isEmptyArray, stripHTML } from '../utils/utils';
import { GenericWordOfTheDayInterface, WordStoreInterface } from '../types';

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
  wordStore.set(getTodaysDateInTheCorrectFormat(), stripHTML(wordObject));
}

export function retrieveLastWordStoreEntry(): GenericWordOfTheDayInterface {
  const wordStore = editJsonFile(wordStorePath);
  const wordStoreObject = wordStore.toObject() as WordStoreInterface;
  const length = Object.keys(wordStoreObject).length;

  return Object.entries(wordStoreObject)[length - 1][1];
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
    .filter(([date]) => {
      const dateInMilliseconds = new Date(date).getTime();

      return (
        dateInMilliseconds >= startDateInMilliseconds &&
        dateInMilliseconds <= endDateInMilliseconds
      );
    })
    .map(({ 1: wordObject }) => wordObject) as GenericWordOfTheDayInterface[];

  return isEmptyArray(rangeQueryValue) ? null : rangeQueryValue;
}

export function retrieveAllWordsFromStore(): GenericWordOfTheDayInterface[] {
  const wordStore = editJsonFile(wordStorePath);
  return Object.entries(wordStore.toObject()).map(({ 1: wordObj }) => wordObj);
}
