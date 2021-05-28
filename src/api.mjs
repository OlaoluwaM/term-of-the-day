import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import editJsonFile from 'edit-json-file';

import { fileURLToPath } from 'url';
import {
  getTodaysDateInTheCorrectFormat,
  filterOutNecessaryProperties,
} from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(path.dirname(path.dirname(__filename)), '.env') });

const wordnickAxios = axios.create({
  baseURL: 'https://api.wordnik.com/v4',
});

async function getSynonymForWordOfTheDay(wordOfTheDay) {
  try {
    const { data: synonymsOfWordOfTheDay } = await wordnickAxios.get(
      `/word.json/${wordOfTheDay}/relatedWords?useCanonical=false&limitPerRelationshipType=14&api_key=${WORDNICK_API_KEY}`
    );
    return synonymsOfWordOfTheDay;
  } catch (error) {
    console.error(chalk.red.bold("\n No synonyms for today's word it seems"));
  }
}

export default async function getWordOfTheDay() {
  const { WORDNICK_API_KEY } = process.env;
  const todaysDate = getTodaysDateInTheCorrectFormat();

  const storeOfPrevWords = editJsonFile(`${__dirname}/store.json`, {
    autosave: true,
  });

  const todaysWordFromStore = storeOfPrevWords.get(todaysDate);
  if (!!todaysWordFromStore) return todaysWordFromStore;

  try {
    const { data: wordOfTheDayObject } = await wordnickAxios.get(
      `/words.json/wordOfTheDay?date=${todaysDate}&api_key=${WORDNICK_API_KEY}`
    );

    let synonymsOfWordOfTheDay = await getSynonymForWordOfTheDay(wordOfTheDayObject.word);

    debugger;
    const returnObject = filterOutNecessaryProperties({
      ...wordOfTheDayObject,
      synonyms: synonymsOfWordOfTheDay ?? [],
      anonyms: undefined,
    });

    storeOfPrevWords.set(todaysDate, returnObject);
    return returnObject;
  } catch (error) {
    console.error(chalk.red.bold(error.response.data.message));
    throw new Error(chalk.red.bold(`An error occurred: ${error.response.data.message}`));
  }
}
