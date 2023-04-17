import {
  intro,
  outro,
  text,
  select,
  confirm,
  multiselect
} from '@clack/prompts'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'

import { COMMIT_TYPES } from './commit-types.js'
import { getChangeFiles, getStagedFiles, gitCommit, gitAdd } from './git.js'

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: Comprueba que estas en un repositorio de git'))
  process.exit(1)
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: 'Selecciona los ficheros que quieres añadir al commit: ',
    options: changedFiles.map(file => ({
      value: file,
      label: file
    }))
  })
  await gitAdd({ files })
}

console.log({ changedFiles, stagedFiles })

intro(colors.inverse(`Asistente para la creación de commits por ${colors.green(' @Macailh ')}`))

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit: '),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} - ${value.description}`
  }))
})

const commitMsg = await text({
  message: `${colors.cyan('Introduce el mensaje del commit: ')} `
})

const { emoji, release } = COMMIT_TYPES[commitType]

let breakingChange = false
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('¿Tiene es commit cambios que rompen la compatiblididad anterior?')}
    ${colors.gray}('Si la respuesta es si, deberias crear un commit con el tipo "BREAKING_CHANGE" y al hacer released se publicara una version major')
    `
  })
}

let commit = `${emoji} ${commitType}: ${commitMsg}`
commit = breakingChange ? `${commit} [breakingChange]` : commit

const shouldContinue = await confirm({
  initialValue: true,
  message: `${colors.cyan('¿Quieres crear el commit con el siguiente mensaje?')}
  ${colors.green(colors.bold(commit))} ¿Confirmas?`
})

if (!shouldContinue) {
  outro(colors.yellow('❌ No se ha creado el commit :('))
  process.exit(0)
}

await gitCommit({ commit })

outro('✅ Commit creado con exito. Gracias por usar el asistente!')
