import chalk from 'chalk';

function normalizeDate(date) {
  return date < 10 ? `0${date}` : date;
}

function getCorrectSynonymType(synonyms, type) {
  return (
    synonyms?.find(({ relationshipType }) => relationshipType === type) ?? { words: [] }
  );
}

function limit(arr, limitTo) {
  return arr.slice(0, limitTo);
}

export function getTodaysDateInTheCorrectFormat(testDate = Date.now()) {
  // Date should be in the format of yyyy-MM-dd

  const [MM, dd, yyyy] = new Date(testDate).toLocaleDateString('en-US').split('/');
  return `${yyyy}-${normalizeDate(MM)}-${normalizeDate(dd)}`;
}

export function filterOutNecessaryProperties(obj) {
  /* desiredProperties = 'word', 'definitions.text','definitions.partOfSpeech','examples.text',
  'note','synonyms', 'anonyms' */

  return {
    word: obj.word,
    definition: obj.definitions[0].text,
    partOfSpeech: obj.definitions[0].partOfSpeech,
    examples: limit(
      obj.examples.map(example => example.text),
      2
    ),
    note: obj.note,
    synonyms: limit(getCorrectSynonymType(obj.synonyms, 'equivalent').words, 4),
    anonyms: limit(getCorrectSynonymType(obj.synonyms, 'anonyms').words, 4),
  };
}

export function prettifyOutput(wordOfTheDayObject) {
  const { anonyms, note } = wordOfTheDayObject;
  const { word, definition, partOfSpeech, examples, synonyms } = wordOfTheDayObject;

  return [
    ["Today's word", `${word} (${partOfSpeech})`],

    ['Definition', definition],

    examples.length > 0 ? ['Examples', examples?.join('\n\n')] : null,

    synonyms.length > 0 ? ['Synonyms', synonyms?.join(', ')] : null,

    anonyms.length > 0 ? ['Anonyms', anonyms?.join(', ')] : null,

    note ? ['Fact', note] : null,
  ]
    .filter(Boolean)
    .map(([tag, content]) => {
      return `${chalk.white.bold(`${tag}`)}\n${chalk.green(content)}`;
    })
    .join('\n\n');
}
