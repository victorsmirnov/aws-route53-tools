#!/usr/bin/env node

import inquirer from 'inquirer'
import updateNotifier from 'update-notifier'
import { commandPrompt } from './command-prompt.js'
import packageJson from '../package.json' assert { type: 'json' }

updateNotifier({ pkg: packageJson }).notify()

const answer = await inquirer.prompt(commandPrompt())
await answer.action.call(undefined)
