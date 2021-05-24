# Word of the day in your terminal

This script queries the [Wordnick](https://developer.wordnik.com/) API and fetches the
word of the day along with its definition, some examples, synonyms and anonyms (if any),
and some other information about the word that you may or may not be interested in.

I made this primarily as a way to learn new words from my terminal as it is easier, at
least for me, than checking my phone which I do not like to do in the morning.

## To use (as of now)

- Clone the project using `git clone`
- Enter the project directory and run `npm i`
- Make the main file executable by running `chmod +x ./src/index.mjs` from the root
  directory, or `chmod +x ./index.mjs` from the 'src' directory
- Then in the root directory, run `npm link` to symlink the script to its defined name
  (`wordOfTheDay`) globally
- You can now run the script globally as `wordOfTheDay`
- If you want to change the command name for this script, which is `wordOfTheDay` by
  default, then you can do so in the `package.json` file.
