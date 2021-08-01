export type FalsyValues = 0 | false | void | null;

export type Await<Type> = Type extends Promise<infer Value> ? Await<Value> : Type;
export type OrUndefined<T, K = keyof T> = Record<K, T[K] | undefined>;

export type CorrectDateFormat = `${string}-${string}-${string}`;

type RelationshipTypes = 'equivalent' | 'antonym';

export interface RelatedWordObject<RT extends RelationshipTypes> {
  relationshipType: RT | string;
  words: string[] | null;
}

export interface WordNickDefinitionsResponseInterface {
  word: string;
  partOfSpeech: string;
  attributionText: string;
  text: string;
}

export interface WordNickExamplesResponseInterface {
  rating: number;
  word: string;
  text: string;
}

export interface GenericWordOfTheDayInterface {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
  anonyms?: string[];
  synonyms?: string[];
}
