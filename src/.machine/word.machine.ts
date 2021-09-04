import ora from 'ora';
import chalk from 'chalk';
import getWordOfTheDay from '../services/serviceApi';

import { interpret } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { MAX_RETRY_COUNT } from '../utils/constants';
import { createWordStore, storeWordObject } from '../wordStore/storeApi';
import {
  logError,
  prettifyOutput,
  prettifyErrorOutput,
  stripFalsyValuesFromProperties,
} from '../utils/utils';

import type { DoneInvokeEvent, ErrorPlatformEvent } from 'xstate';
import type { Await, GenericWordOfTheDayInterface } from '../types';

let wordMachineSpinner = ora(`Fetching today's word\n`);

interface MachineContextInterface {
  wordObj?: Partial<GenericWordOfTheDayInterface>;
  retries: number;
  errors: Set<string>;
}

type ReturnedServiceData = Await<ReturnType<typeof getWordOfTheDay>>;

const wordOfTheDayMachineContext: MachineContextInterface = {
  wordObj: undefined,
  retries: 0,
  errors: new Set<string>(),
};

const machineModel = createModel(wordOfTheDayMachineContext, {
  events: {
    FETCH: () => ({}),
    RETRY: () => ({}),
    DONE: (data: ReturnedServiceData) => ({ data }),
    ERROR: (data: Error | string) => ({ data }),
  },
});

function canRetry(context: MachineContextInterface) {
  return context.retries < MAX_RETRY_COUNT;
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

const setWordDataIntoContext = machineModel.assign({
  wordObj: (context, _event: any) => {
    const event: DoneInvokeEvent<ReturnedServiceData> = _event;

    return stripFalsyValuesFromProperties(
      event.data
    ) as Partial<GenericWordOfTheDayInterface>;
  },
});

const storeErrorInContext = machineModel.assign({
  errors: (context, _event: any) => {
    const event: ErrorPlatformEvent = _event;
    if (!('data' in event)) return context?.errors ?? undefined;

    return context.errors.add(event.data?.message ?? event.data);
  },
});

const wordMachine = machineModel.createMachine(
  {
    initial: 'idle',
    context: machineModel.initialContext,

    states: {
      idle: {
        entry: 'createWordStoreAction',
        on: {
          FETCH: {
            target: 'pending',
            actions: ['startSpinner'],
          },
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
              actions: ['storeErrorInContext', 'announceRetry', 'incrementRetries'],
              cond: 'canRetry',
            },
            { target: 'failure' },
          ],
        },
      },

      success: {
        entry: ['stopSpinnerOnSuccess', 'storeWordObjectAction', 'outputWordOfTheDay'],
        type: 'final',
      },

      failure: {
        entry: ['stopSpinnerOnFailure', 'announceErrors'],
        on: {
          RETRY: { target: 'pending', actions: 'resetRetries' },
        },
      },
    },
  },
  {
    guards: {
      canRetry: canRetry,
    },

    actions: {
      incrementRetries: incrementRetries,
      outputWordOfTheDay: outputWordOfTheDay,
      resetRetries: resetRetries,
      setWordDataIntoContext: setWordDataIntoContext,
      storeErrorInContext: storeErrorInContext,

      announceRetry: (context: any) => {
        wordMachineSpinner.warn(
          chalk.yellowBright.bold(` Retrying (${context.retries}/${MAX_RETRY_COUNT})`)
        );
      },

      createWordStoreAction: () => createWordStore(),

      storeWordObjectAction: (context: any) => {
        storeWordObject(context.wordObj as GenericWordOfTheDayInterface);
      },

      announceErrors: (context: typeof machineModel.initialContext) => {
        if (!context.errors.size) {
          logError('No errors to log out');
          return;
        }

        prettifyErrorOutput(context.errors);
      },

      startSpinner: () => {
        console.log('');
        wordMachineSpinner.start();
      },

      stopSpinnerOnSuccess: () => {
        wordMachineSpinner.succeed(chalk.greenBright.bold(' Done!'));
      },

      stopSpinnerOnFailure: () => {
        console.log('');
        wordMachineSpinner.fail(
          chalk.redBright.bold(` Failed to fetch word of the day\n`)
        );
      },
    },

    services: {
      getWordOfTheDay: () => getWordOfTheDay,
    },
  }
);

const wordService = interpret(wordMachine);
export default wordService;
