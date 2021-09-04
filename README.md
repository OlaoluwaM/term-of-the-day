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

Still under development, but works great. Let me know if you have any suggestions. You can
install it from [NPM](https://www.npmjs.com/package/term-of-the-day)

```bash
npm i -g term-of-the-day
```

Then run `termOfTheDay` and see what happens 😉

Since this is a CLI, it accepts arguments. These arguments tell the CLI where to scrape
your word of the day from Currently, the script only scrapes from

- merriam-webster.com
- dictionary.com

You can choose between these sites by passing either

- `termOfTheDay --M` or `termOfTheDay --merriam` to scrape from merriam-webster.com
- `termOfTheDay --D` or `termOfTheDay --dictionary` to scrape from Dictionary.com
- By default calling the `termOfTheDay` is equivalent to `termOfTheDay --M`
- By default words scraped are stored in a json file, however, if you do not want to store
  a word you can use the `--N` flag
- Dates must be in the format `yyyy-mm-dd`
- To get an already scraped word scraped

  ```bash
  # From Merriam Webster (if such an entry exists)
  termOfTheDay --M --from "2021-08-22"

  # From Dictionary.com
  termOfTheDay --D --from "2021-08-22"
  ```

## Roadmap

- Add tests
- Improve documentation
- Make CLI implementation more robust with a help option
