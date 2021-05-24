import ora from 'ora';
import boxen from 'boxen';
import getWordOfTheDay from './api.mjs';

import { prettifyOutput } from './helper.mjs';
import { MAX_RETRY_COUNT } from './constants.mjs';
import { createMachine, assign, interpret } from 'xstate';

const wordMachineSpinner = ora("Fetching today's word \n");

const setWordDataIntoContext = assign({
  wordOfTheDay: (_, event) => event.data,
});

const incrementRetries = assign({
  retries: ({ retries }) => (retries += 1),
});

const resetRetries = assign({
  retries: 0,
});

function canRetry(context) {
  return context.retries < MAX_RETRY_COUNT;
}

function announceRetry({ retries }) {
  if (retries === 1) wordMachineSpinner.fail('Ooops, something went wrong!');
  wordMachineSpinner.text = `Retrying... (${retries} / ${MAX_RETRY_COUNT})`;
}

function showLoadingSpinner({ retries }) {
  if (retries === 0) console.log('\n');
  wordMachineSpinner.start();
}

function stopSpinnerOnSuccess() {
  wordMachineSpinner.succeed('Fetch successful');
}

function stopSpinnerOnFailure() {
  wordMachineSpinner.fail("Sorry! Couldn't get today's word \n");
}

function outputWordOfTheDay({ wordOfTheDay }) {
  console.log(
    boxen(prettifyOutput(wordOfTheDay), { padding: 1, borderStyle: 'classic' })
  );
}

const wordMachine = createMachine(
  {
    initial: 'idle',

    context: {
      wordObj: undefined,
      retries: 0,
    },

    states: {
      idle: {
        on: {
          FETCH: { target: 'pending' },
        },
      },

      pending: {
        entry: 'showLoadingSpinner',

        invoke: {
          src: 'getWordOfTheDay',

          onDone: {
            target: 'success',
            actions: 'setWordDataIntoContext',
          },

          onError: [
            {
              target: 'pending',
              actions: ['announceRetry', 'incrementRetries'],
              cond: 'canRetry',
            },
            { target: 'failure' },
          ],
        },
      },

      success: {
        entry: ['stopSpinnerOnSuccess', 'outputWordOfTheDay'],
        type: 'final',
      },

      failure: {
        entry: 'stopSpinnerOnFailure',

        on: {
          RETRY: { target: 'pending', actions: 'resetRetries' },
        },
      },
    },
  },
  {
    actions: {
      setWordDataIntoContext,
      incrementRetries,
      resetRetries,
      announceRetry,
      showLoadingSpinner,
      stopSpinnerOnSuccess,
      stopSpinnerOnFailure,
      outputWordOfTheDay,
    },
    guards: {
      canRetry,
    },
    services: {
      getWordOfTheDay,
    },
  }
);

const wordService = interpret(wordMachine);
export default wordService;
