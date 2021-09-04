export const EXAMPLES_LIMIT = 7;
export const MAX_RETRY_COUNT = 5;
export const DEFINITION_LIMIT = 100;
export const LIMIT_PER_RELATIONSHIP_TYPE = 12;
export const correctDateFormatPattern = new RegExp(/\d\d\d\d-\d\d-\d\d/);

export enum resolveSiteToPartialUrl {
  'Merriam Webster' = 'merriam-webster.com',
  'Dictionary' = 'dictionary.com',
}
export enum SiteOptions {
  '--M' = 'Merriam Webster',
  '--merriam' = 'Merriam Webster',
  '--D' = 'Dictionary',
  '--dictionary' = 'Dictionary',
}

// CLI arguments
export const argumentsForNonStorage = ['--N', '--no-store'];
export const possibleArgumentsForMerriamWebster = ['--M', '--merriam'];
export const possibleArgumentsForDictionaryDotCom = ['--D', '--dictionary'];
export const argumentsForPastWordRetrieval = '--from';
