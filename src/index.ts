#!/usr/bin/env node

import wordService from './.machine/word.machine';

wordService.start();
wordService.send({ type: 'FETCH' });
