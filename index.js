#!/usr/bin/env node

const prompt = require('prompt');
const colors = require("colors/safe");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const format_plural = (n, singular, plural, delimiter = ' ') => {
  return n === 1 ? `${n}${delimiter}${singular}` : `${n}${delimiter}${plural}`;
}

const BASE_URL = 'http://loulouapp.com';

prompt.message = '';

prompt.start();

prompt.get({
  properties: {
    username: {
      description: colors.blue('Enter a username that should be used for repetitive voting'),
      required: true,
    },
    url: {
      pattern: /.*loulouapp\.com\/pollMain\.php\?tag=([0-9]{6}).*$/,
      description: colors.blue('Enter a valid LouLou URL'),
      message: 'URL must be a valid LouLouApp url, for example: http://loulouapp.com/pollMain.php?tag=622022dilfdoqgzp6jcgn8r',
      required: true,
    },
  },
}, (err, result) => {
  const matches = /.*loulouapp\.com\/pollMain\.php\?tag=([0-9]{6}).*/g.exec(result.url);
  if (typeof matches[1] === 'undefined') {
    return false;
  }

  const { username } = result;
  const question_id = parseInt(matches[1]);
  const opts =  {
    headers: {
      cookie: `name=whatever; random=${Math.random()}`
    },
  };

  fetch(result.url, opts)
    .then((res) => res.text())
    .then((body) => {
      const $ = cheerio.load(body);

      const answers = [];
      const answersPrompMessages = [];
      $('#answers > li > a').each((index, item) => {
        const text = $(item).find('.answer')[0].children[0].data.trim();
        const id = item.attribs.id;
        const responses = parseInt($(item).find('.responses')[0].children[0].data);
        answers.push({ id, text, responses });
        answersPrompMessages.push(`[${index + 1}] ${text} (${format_plural(responses, 'answer', 'answers')})`);
      });

      prompt.get({
        properties: {
          answersToVote: {
            pattern: /[0-9]+/,
            required: true,
            message: 'You should atleast provide some numbers',
            description: colors.white(`${answersPrompMessages.join('\n')}`) + colors.blue('\nEnter the numbers of the answers you would like to vote on, separated by comma'),
            before: (value) => value.split(',').map((value) => {
              const v = Math.abs(parseInt(value));
              const index = v - 1;
              if (typeof answers[index] !== 'undefined') {
                return answers[index];
              } else {
                console.log(`Answer ${v} does not exists, Skipping.`);
                return false;
              }
            }).filter(Boolean),
          },
          amount: {
            pattern: /[0-9]+/,
            required: true,
            type: 'number',
            message: 'Only integers are allowed',
            default: 1,
            description: colors.blue('How many times would you like to vote?'),
            before: (v) => Math.abs(v),
          },
        },
      }, (err, result) => {
        let delay = 0;
        const delayIncrement = 50;
        for (let i = 0; i < result.amount; i++) {
          result.answersToVote.forEach((answer, index) => {
            const uname = username.replace('%INDEX%', i + 1)
            const opts = {
              headers: {
                cookie: `name=${uname}; random=${Math.random()}`,
              },
            };
            setTimeout(() => {
              fetch(`${BASE_URL}/pollSubmit.php?answer=${answer.id}&question_id=${question_id}`, opts);
              process.stdout.write(`voted ${format_plural(i + 1, 'time', 'times')}\r`);
            }, delay);
            delay += delayIncrement;
          });
        }
      })
    });
});
