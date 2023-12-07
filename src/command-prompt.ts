import type { ListChoiceOptions, QuestionCollection } from 'inquirer'
import { checkCloudFront } from './commands/check-cloud-front.js'
import { checkNsRecords } from './commands/check-ns-records.js'
import { quit } from './commands/quit.js'

export interface CommandAnswers {
  readonly action: () => Promise<void>
}

export function commandPrompt (): QuestionCollection<CommandAnswers> {
  const actions: ListChoiceOptions[] = [
    { name: 'Check hosted zones', value: checkNsRecords },
    { name: 'Check CloudFront records', value: checkCloudFront },
    { name: 'Quit', value: quit }
  ]

  return [
    { choices: actions, message: 'Choose action', name: 'action', pageSize: 10, type: 'list' }
  ]
}
