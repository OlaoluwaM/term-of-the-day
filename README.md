# Term of the terminal

- [Term of the terminal](#term-of-the-terminal)
  - [Motivation](#motivation)
  - [How to use](#how-to-use)
  - [Roadmap](#roadmap)

## Motivation

I made this primarily because I wanted to learn new words everyday but didn't always get
around to checking my phone for it, I would always skip or procrastinate.

However, by having it display in my terminal, which I open countless times in a day, I
won't have the ability to procrastinate as the word would be right in front of me.

## How to use

Still under development, but nearly finished 😄. If you want to use you'd have to clone
the repo and run the following

- `npm install` (run this inside the repo's directory)
- `npm i -g .` (to install this globally)
- Then try invoking the command `wordOfTheDay` in your terminal

Since this is a CLI, it accepts arguments. These arguments tell the CLI where to scrape
your term of the day from Currently, the script only scrapes from

- merriam-webster.com
- dictionary.com

You can choose between these sites by passing either

- `wordOfTheDay --M` or `wordOfTheDay --merriam` to scrape from merriam-webster.com
- `wordOfTheDay --D` or `wordOfTheDay --dictionary` to scrape from Dictionary.com
- By default calling the `wordOfTheDay` is equivalent to `wordOfTheDay --M`
- By default words scraped are stored in a json file, however, if you do not want to store
  a word you can use the `--N` flag

## Roadmap

- Add API for working with the word Store
- Improve documentation
- Package CLI for npm
