import 'dotenv/config';

import { wordnickAxios } from './config';
import { limit, parseRelationship } from '../utils/utils';
import {
  EXAMPLES_LIMIT,
  DEFINITION_LIMIT,
  LIMIT_PER_RELATIONSHIP_TYPE,
} from '../utils/constants';
import type {
  RelatedWordObject,
  RelationshipTypes,
  WordNickDefinitionsResponseInterface,
} from '../types';

import type { WordNickExamplesResponseInterface } from '../types';

const { WORDNICK_API_KEY } = process.env;

export type GenericResponse<R> = {
  type: 'synonyms' | 'anonyms' | 'definitions' | 'examples';
  value: R;
};

export async function getRelatedWordsFromWordNick<T extends RelationshipTypes>(
  word: string,
  desiredRelationship: T
): Promise<GenericResponse<RelatedWordObject<T>['words']>> | never {
  try {
    const wordNickResponse = await wordnickAxios.get<RelatedWordObject<T>[]>(
      `/${word}/relatedWords?limitPerRelationshipType=${LIMIT_PER_RELATIONSHIP_TYPE}&api_key=${WORDNICK_API_KEY}`
    );

    const desiredRelatedWords: RelatedWordObject<T>['words'] =
      wordNickResponse.data.filter(
        ({ relationshipType }) => relationshipType === desiredRelationship
      )?.[0]?.words ?? null;

    return {
      type: parseRelationship(desiredRelationship),
      value: desiredRelatedWords,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getDefinition(
  word: string
): Promise<GenericResponse<WordNickDefinitionsResponseInterface['text'][]>> | never {
  try {
    const wordNickResponse = await wordnickAxios.get<
      Partial<WordNickDefinitionsResponseInterface>[]
    >(`/${word}/definitions?limit=${DEFINITION_LIMIT}&api_key=${WORDNICK_API_KEY}`);

    const definitions = limit(wordNickResponse?.data ?? [{ text: 'err' }], 5).map(
      ({ text }) => text
    ) as WordNickDefinitionsResponseInterface['text'][];

    return { type: 'definitions', value: definitions[0] === 'err' ? [] : definitions };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getExamples(
  word: string
): Promise<GenericResponse<WordNickExamplesResponseInterface['text'][]>> | never {
  try {
    const wordNickResponse = await wordnickAxios.get<{
      examples: Partial<WordNickExamplesResponseInterface>[];
    }>(
      `/${word}/examples?limit=${EXAMPLES_LIMIT}&includeDuplicates=false&api_key=${WORDNICK_API_KEY}`
    );

    const examples = limit(wordNickResponse?.data?.examples ?? [{ text: 'err' }], 5).map(
      ({ text }) => text
    ) as WordNickExamplesResponseInterface['text'][];

    return {
      type: 'examples',
      value: examples[0] === 'err' ? [] : examples,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
