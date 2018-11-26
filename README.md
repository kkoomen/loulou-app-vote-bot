# LouLou App Vote Bot

Because this voting app has no security at all, I decided to make a command-line
interface that would prompt some questions and based on that we do an X amount
of voting on a question.

Also, this is a small application just for fun and if you want to make clear to
everyone what _your_ opinion is, you are able to express that really well with
this vote bot.

# Options

- When prompted for your username, it will use it in a repetitive way. If you
  want to make it unique every time it votes, you can use the token `%INDEX%`
  which will be replaced with the actual index number. For example:
  `test-user-%INDEX%` will result in:<br />
  ```
  test-user-1
  test-user-2
  test-user-3
  ...
  ```

# Getting Started

- `git clone https://github.com/kkoomen/loulou-app-vote-bot`
- `yarn install`
- `node index.js`

# License

MIT.
