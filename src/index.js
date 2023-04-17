import {
  intro,
  outro,
  text,
  select
} from '@clack/prompts'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'

import { COMMIT_TYPES } from './commit-types.js'
import { getChangeFiles, getStagedFiles } from './git.js'

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: Comprueba que estas en un repositorio de git'))
  process.exit(1)
}

if (stagedFiles.length === 0) {
  // TODO: select the files to commit
  outro(colors.red('Error: No hay archivos en el stage'))
  process.exit(1)
}

console.log({ changedFiles, stagedFiles })

intro(colors.inverse(`Asistente para la creación de commits por ${colors.green(' @Macailh ')}`))

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit: '),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key} - ${value.description}`
  }))
})

console.log(commitType)

const commitMsg = await text({
  message: 'Introduce el mensaje del commit: ',
  placeholder: 'Add new feature'
})

console.log(commitMsg)

outro('Commit creado con exito. Gracias por usar el asistente!')
