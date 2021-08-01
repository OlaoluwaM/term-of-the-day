import ora from 'ora';
import chalk from 'chalk';
import getWordOfTheDay from '../services/api';

import { interpret } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { MAX_RETRY_COUNT } from '../utils/constants';
import { prettifyOutput, stripFalsyValuesFromProperties } from '../utils/utils';

import type { Await, GenericWordOfTheDayInterface } from '../types';

const wordMachineSpinner = ora("Fetching today's word\n");

interface MachineContextInterface {
  wordObj?: Partial<GenericWordOfTheDayInterface>;
  retries: number;
}

type ReturnedServiceData = Await<ReturnType<typeof getWordOfTheDay>>;

const wordOfTheDayMachineContext: MachineContextInterface = {
  wordObj: undefined,
  retries: 0,
};

const machineModel = createModel(wordOfTheDayMachineContext, {
  events: {
    FETCH: () => ({}),
    RETRY: () => ({}),
    DONE: (data: ReturnedServiceData) => ({ data }),
  },
});

function canRetry(context: MachineContextInterface) {
  return context.retries <= MAX_RETRY_COUNT;
}

function outputWordOfTheDay(context: MachineContextInterface) {
  prettifyOutput(context.wordObj as GenericWordOfTheDayInterface);
}

const incrementRetries = machineModel.assign({
  retries: context => (context.retries += 1),
});

const resetRetries = machineModel.assign({
  retries: 0,
});

const setWordDataIntoContext = machineModel.assign(
  {
    wordObj: (context, event) =>
      stripFalsyValuesFromProperties(event.data) as Partial<GenericWordOfTheDayInterface>,
  },
  'DONE'
);

const wordMachine = machineModel.createMachine(
  {
    initial: 'idle',
    context: machineModel.initialContext,

    states: {
      idle: {
        on: {
          FETCH: { target: 'pending', actions: 'startSpinner' },
        },
      },

      pending: {
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
        on: {
          RETRY: { target: 'pending', actions: 'resetRetries' },
        },
      },
    },
  },
  {
    actions: {
      canRetry: canRetry,
      incrementRetries: incrementRetries,
      outputWordOfTheDay: outputWordOfTheDay,
      resetRetries: resetRetries,
      setWordDataIntoContext: setWordDataIntoContext as any,

      announceRetry: context => {
        wordMachineSpinner.start(
          chalk.red.bold(` Retrying  (${context.retries}/${MAX_RETRY_COUNT})`)
        );
      },
      startSpinner: () => {
        console.log('');
        wordMachineSpinner.start();
      },
      stopSpinnerOnSuccess: () => {
        wordMachineSpinner.succeed(chalk.greenBright.bold(' Done!'));
      },
      stopSpinnerOnFailure: () => {
        wordMachineSpinner.fail(` Failed to fetch word of the day`);
      },
    },

    services: {
      getWordOfTheDay: () => getWordOfTheDay(),
    },
  }
);

const wordService = interpret(wordMachine);
export default wordService;
