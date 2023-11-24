import type { ListChoiceOptions, QuestionCollection } from 'inquirer'

export interface CommandAnswers {
  readonly action: string
}

export function commandPrompt (): QuestionCollection<CommandAnswers> {
  const actions: ListChoiceOptions[] = [
    { name: 'Check hosted zones', value: 'check-hosted-zones' },
    { name: 'Quit', value: 'quit' }
  ]

  return [
    { choices: actions, message: 'Choose action', name: 'action', pageSize: 10, type: 'list' }
  ]
}
