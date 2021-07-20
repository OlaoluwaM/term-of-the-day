import axios from 'axios';

export const wordnickAxios = axios.create({
  baseURL: 'https://api.wordnik.com/v4/word.json',
});
