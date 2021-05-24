#!/usr/bin/env node

import wordService from './word.machine.mjs';

wordService.start();
wordService.send({ type: 'FETCH' });
