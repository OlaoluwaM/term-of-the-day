import { getTodaysDateInTheCorrectFormat } from './utils';
import {
  SiteOptions,
  argumentsForNonStorage,
  argumentsForEntryUpdate,
  correctDateFormatPattern,
  argumentsForPastWordRetrieval,
} from './constants';

import type { CorrectDateFormat, PossibleScriptParameters } from '../types';

// CLI flags
const cliArguments = process.argv.slice(2);

export const updateWordEntry = cliArguments.some(arg =>
  argumentsForEntryUpdate.includes(arg)
);

export const wordShouldBeStored = !cliArguments.some(arg =>
  argumentsForNonStorage.includes(arg)
);

const pastDateIndex = cliArguments.indexOf(argumentsForPastWordRetrieval);
export const usePastDate = pastDateIndex > -1;

// CLI Values
export const siteArgument =
  cliArguments.find(args => Object.prototype.hasOwnProperty.call(SiteOptions, args)) ??
  '--M';

let dateToRetrieveFrom = getTodaysDateInTheCorrectFormat();
if (usePastDate) {
  const pastDate = cliArguments?.[pastDateIndex + 1];
  if (correctDateFormatPattern.test(pastDate)) {
    dateToRetrieveFrom = pastDate as CorrectDateFormat;
  }
}

export const dateToUse = dateToRetrieveFrom;
export const siteToScrapeFrom: 'Merriam Webster' | 'Dictionary' =
  SiteOptions[siteArgument as PossibleScriptParameters];
