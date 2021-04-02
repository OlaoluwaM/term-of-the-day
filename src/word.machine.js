const path = require('path');
require('dotenv').config({
  path: path.resolve(path.dirname(path.dirname(__filename)), '.env'),
});

const axios = require('axios').default;

const { createMachine, assign, interpret } = require('xstate');
const { MAX_RETRY_COUNT } = require('./constants');

async function getWordDefinition() {
  const wordDefinitionURL = 'https://wordsapiv1.p.rapidapi.com/words/?random=true';
  const { RAPID_API_KEY } = process.env;

  const { data: wordDefinitionData } = await axios.get(wordDefinitionURL, {
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
    },
  });

  return wordDefinitionData;
}

const canRetry = ({ retries }) => retries <= MAX_RETRY_COUNT;
const incrementRetries = assign({ retries: ({ retries }) => retries + 1 });
const announceRetry = () => console.log('Oops, something went wrong, retrying!!');
const checkRetries = ({ retries }) => console.log(retries);

const wordMachine = createMachine(
  {
    initial: 'idle',

    context: {
      word: undefined,
      results: undefined,
      retries: 0,
    },

    states: {
      idle: {
        on: {
          fetch: 'pending',
        },
      },

      pending: {
        invoke: {
          id: 'getDefinition',
          src: async () => {
            try {
              const wordDefinition = await getWordDefinition();
              if (!wordDefinition.results) throw new Error('No definition was returned');
              return wordDefinition;
            } catch (error) {
              throw error;
            }
          },

          onDone: {
            target: 'resolved',
            actions: assign({
              word: (_, event) => event.data.word,
              results: (_, event) => event.data.results,
            }),
          },

          onError: {
            target: 'rejected',
            actions: 'incrementRetries',
          },
        },
      },

      resolved: {
        type: 'final',
      },

      rejected: {
        always: [
          {
            target: 'pending',
            cond: 'canRetry',
          },
        ],

        on: {
          reset: {
            target: 'idle',
            actions: assign({ retries: 0 }),
          },
        },
      },
    },
  },
  {
    actions: {
      incrementRetries,
      checkRetries,
      announceRetry,
    },

    guards: {
      canRetry,
    },
  }
);

const wordService = interpret(wordMachine);

module.exports.wordService = wordService;
