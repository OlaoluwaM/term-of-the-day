import { isIntegerOrUndefined } from './utils';

import type { PossibleScriptParameters } from '../types';

export const EXAMPLES_LIMIT = 7;
export const MAX_RETRY_COUNT = 5;
export const DEFINITION_LIMIT = 100;
export const LIMIT_PER_RELATIONSHIP_TYPE = 12;

const argumentsForNonStorage = ['--N', '--no-store'];

export const possibleArgumentsForMerriamWebster = ['--M', '--merriam'];
export const possibleArgumentsForDictionaryDotCom = ['--D', '--dictionary'];

export enum SiteOptions {
  '--M' = 'Merriam Webster',
  '--merriam' = 'Merriam Webster',
  '--D' = 'Dictionary',
  '--dictionary' = 'Dictionary',
}

export enum resolveSiteToPartialUrl {
  'Merriam Webster' = 'merriam-webster.com',
  'Dictionary' = 'dictionary.com',
}

const cliArguments = process.argv.slice(2);

export const siteArgument =
  cliArguments.find(args => Object.prototype.hasOwnProperty.call(SiteOptions, args)) ??
  '--M';

const storageSettings =
  isIntegerOrUndefined(
    cliArguments.findIndex(arg => argumentsForNonStorage.includes(arg))
  ) ?? true;

export const wordShouldBeStored = !(typeof storageSettings === 'number');
export const siteToScrapeFrom: 'Merriam Webster' | 'Dictionary' =
  SiteOptions[siteArgument as PossibleScriptParameters];

// console.log({ wordShouldBeStored, siteToScrapeFrom });
