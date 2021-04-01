# Word of the day in your terminal

This script queries the [wordsAPI](https://rapidapi.com/dpventures/api/wordsapi?endpoint=54c00ec8e4b0ae089320058a) and fetches a random word
along with the definition and other components of the word, then it renders it in a nice table format using termkit. It also makes use of state machines for the fetch, retry and success logic.

I made this primarily as a way to learn new words from my terminal as it is easier, at least for me, than checking my phone which I do not like to do in the morning.
