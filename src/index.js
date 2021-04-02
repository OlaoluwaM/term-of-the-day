const term = require('terminal-kit').terminal;

const { MAX_RETRY_COUNT } = require('./constants');
const { wordService } = require('./word.machine');

function formatForStdout(definitionsObj) {
  const { word, wordResults } = definitionsObj;
  const capitalizedWord = word.replace(word[0], word[0].toLocaleUpperCase());

  term.bold.green(`\n${capitalizedWord}\n`);
  term.table([['Definition', 'Type', 'Synonyms'], ...wordResults], {
    hasBorder: true,
    fit: true,
    width: term.width,
    borderChars: 'lightRounded',
  });
}

function filterDefinitionData(definitionData) {
  const {
    word,
    results = {
      definition: 'No definition',
      partOfSpeech: 'No type',
      synonyms: 'No synonyms',
    },
  } = definitionData;

  const desiredResults = Array.isArray(results) ? results : [results];
  const filteredData = desiredResults.map(({ definition, partOfSpeech, synonyms }) => {
    const synonymsToReturn = Array.isArray(synonyms) ? synonyms.join(', ') : synonyms;
    return [definition, partOfSpeech, synonymsToReturn];
  });

  return { wordResults: filteredData, word };
}

wordService.onTransition(state => {
  const currentState = state.value;

  const { retries, results, word } = state.context;

  if (retries >= MAX_RETRY_COUNT && currentState === 'rejected') {
    console.error('Sorry nothing yet. Until next time');
  } else if (currentState === 'resolved') {
    formatForStdout(filterDefinitionData({ results, word }));
  }
});

wordService.start();
wordService.send({ type: 'fetch' });
