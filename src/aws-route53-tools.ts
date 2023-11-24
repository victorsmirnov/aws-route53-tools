#!/usr/bin/env node

import inquirer from 'inquirer'
import updateNotifier from 'update-notifier'
import { checkNsRecords } from './check-ns-records.js'
import { commandPrompt } from './command-prompt.js'
import packageJson from '../package.json' assert { type: 'json' }

updateNotifier({ pkg: packageJson }).notify()

const answer = await inquirer.prompt(commandPrompt())

switch (answer.action) {
  case 'check-hosted-zones':
    await checkNsRecords()
    break
  case 'quit':
    break
  default:
    throw new Error(`Unknown action: ${answer.action}`)
}
