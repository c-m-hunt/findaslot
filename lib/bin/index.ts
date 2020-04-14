#!/usr/bin/env node

import inquirer from 'inquirer';
import figlet from 'figlet';
import clear from 'clear';
import { promisify } from 'util';
import { Iceland } from '../supermarkets';
import { Pushover } from '../notifier/pushover';
import { Notifier } from '../notifier/base';
import { SupermarketOptions } from '../supermarkets/types';

const figletProm = promisify(figlet);

interface Answers {
  supermarket: 'Iceland';
  username: string;
  password: string;
  refresh: number;
}

const questions = [
  {
    type: 'list',
    name: 'supermarket',
    message: 'Which supermarket you want to find a slot for?',
    choices: ['Iceland']
  },
  {
    type: 'input',
    name: 'username',
    message: 'What is your supermarket username?',
  },
  {
    type: 'password',
    name: 'password',
    message: 'What is your supermarket password?'
  },
  {
    type: 'number',
    name: 'refresh',
    message: 'How often in seconds would you like to retry?',
    default: 60
  }
];

const askQuestions = async (): Promise<Answers> => {
  clear();
  const title = await figletProm('FindASlot');
  console.log(title);
  return await inquirer.prompt<Answers>(questions);
}

askQuestions()
  .then(answers => {
    const user = process.env['PUSHOVER_USER'];
    const token = process.env['PUSHOVER_TOKEN'];
    const options: SupermarketOptions<Notifier> = {
      refresh: answers.refresh,
      notifier: user && token ? new Pushover(token, [user]) : new Notifier()
    }
    if (answers.supermarket === 'Iceland') {
      const i = new Iceland(answers.username, answers.password, options);
      i.run();
    }
  })