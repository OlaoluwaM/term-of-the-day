const wordMachine = require('../src/word.machine').wordMachine;

test('Should make sure machine, transitions to correct state on event', () => {
  const { initial: initialState } = wordMachine;
  expect(initialState).toBe('idle');

  const newState = wordMachine.transition('idle', 'fetch');
  expect(newState.matches('pending')).toBeTruthy();
});
