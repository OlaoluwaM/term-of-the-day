import chalk from 'chalk';
import scrapeDictionaryDotCom from './dictionary.com';
import scrapeMerriamWebsterDotCom from './merriam-webster.com';

import {
  siteArgument,
  possibleArgumentsForMerriamWebster,
  possibleArgumentsForDictionaryDotCom,
} from './../utils/constants';

function scrapeSite() {
  if (possibleArgumentsForMerriamWebster.includes(siteArgument)) {
    return scrapeMerriamWebsterDotCom;
  } else if (possibleArgumentsForDictionaryDotCom.includes(siteArgument)) {
    return scrapeDictionaryDotCom;
  }

  return scrapeDictionaryDotCom;
}

const scrapeFunctionToUse = scrapeSite();

export default scrapeFunctionToUse;
