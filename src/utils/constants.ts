import type { PossibleScriptParameters } from '../types';

export const MAX_RETRY_COUNT = 5;
export const LIMIT_PER_RELATIONSHIP_TYPE = 12;
export const DEFINITION_LIMIT = 100;
export const EXAMPLES_LIMIT = 7;

export const possibleArgumentsForMerriamWebster = ['--M', '--merriam'];
export const possibleArgumentsForDictionaryDotCom = ['--D', '--dictionary'];

export enum SiteOptions {
  '--M' = 'Merriam Webster',
  '--merriam' = 'Merriam Webster',
  '--D' = 'Dictionary.com',
  '--dictionary' = 'Dictionary.com',
}

export const siteArgument = process.argv.slice(2)[0];
export const siteToScrapeFrom =
  SiteOptions[process.argv.slice(2)[0] as PossibleScriptParameters];
