const wordMachine = require('../src/word.machine').wordMachine;

const { interpret } = require('xstate');

let wordService;
beforeAll(() => {
  wordService = interpret(wordMachine.withConfig({
    services: {
      fetchWordDefinition: async () => {
        
      }
    }
  }));
});
