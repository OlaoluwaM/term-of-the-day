import scrapeDictionaryDotCom from './dictionary.com';
import scrapeMerriamWebsterDotCom from './merriam-webster.com';

import { siteArgument } from '../utils/cliArgs';
import {
  possibleArgumentsForMerriamWebster,
  possibleArgumentsForDictionaryDotCom,
} from './../utils/constants';

function scrapeSite() {
  if (possibleArgumentsForMerriamWebster.includes(siteArgument)) {
    return scrapeMerriamWebsterDotCom;
  } else if (possibleArgumentsForDictionaryDotCom.includes(siteArgument)) {
    return scrapeDictionaryDotCom;
  }

  return scrapeMerriamWebsterDotCom;
}

const scrapeFunctionToUse = scrapeSite();

export default scrapeFunctionToUse;
