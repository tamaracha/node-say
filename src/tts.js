'use strict'
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const os = require('os')
const uuidv4 = require('uuid').v4

module.exports = { getVoices, speak }

/**
 * @typedef {object} Voice
 * @property {string} name
 * @property {string} lang
*/

/**
 * @return {Promise<Voice[]>}
*/
async function getVoices () {
  const { stdout, stderr } = await exec('say -v ?')
  if (stderr) throw stderr
  if (stdout === undefined) return []
  /** @type {string[]} */
  const lines = stdout.split('\n').filter(l => l !== '')
  /** @type {Voice[]} */
  const voices = []
  lines.forEach(v => {
    const lm = v.match(/[a-z]{2}_[A-Z]{2}/)
    if (lm !== null) {
      const lang = lm[0]
      const name = v.slice(0, lm.index).trim()
      voices.push({ name, lang })
    }
  })
  return voices
}

/**
 * @param {object} opts
 * @param {string} opts.voice
 * @param {string} opts.text
 * @return {Promise<{ filepath: string, data: fs.ReadStream }>}
*/
async function speak (opts) {
  const filepath = path.format({
    dir: os.tmpdir(),
    name: uuidv4(),
    ext: '.wav'
  })
  const cmd = ['say --data-format LEI16@48000']
  cmd.push(...['-o', filepath])
  if (opts.voice) cmd.push(...['-v', opts.voice])
  cmd.push(opts.text)
  const { stderr } = await exec(cmd.join(' '))
  if (stderr !== '') throw stderr
  const data = fs.createReadStream(filepath)
  /** @type {Error} */
  let hadError
  data.on('error', (err) => {
    hadError = err
  })
  data.on('close', () => {
    if (hadError !== undefined) fs.promises.unlink(filepath)
  })
  return { filepath, data }
}
