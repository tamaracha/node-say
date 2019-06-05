'use strict'
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const aw = require('await-fs')
const os = require('os')
const uuidv4 = require('uuid/v4')

module.exports = { getVoices, speak }

async function getVoices () {
  const { stdout, stderr } = await exec('say -v ?')
  if (stderr) throw stderr
  return stdout.split('\n')
    .map(v => {
      if (!v) return
      const lm = v.match(/[a-z]{2}_[A-Z]{2}/)
      if (!lm) return
      const lang = lm[0]
      const name = v.slice(0, lm.index).trim()
      return { name, lang }
    })
    .filter(v => !!v)
}

async function speak (opts) {
  const filepath = path.format({
    dir: os.tmpdir(),
    name: uuidv4(),
    ext: '.wav'
  })
  let cmd = ['say --data-format LEI16@48000']
  cmd.push(...['-o', filepath])
  if (opts.voice) cmd.push(...['-v', opts.voice])
  cmd.push(opts.text)
  const { stderr } = await exec(cmd.join(' '))
  if (stderr) throw stderr
  const stream = fs.createReadStream(filepath, { bufferSize: 64 * 1024 })
  let hadError = null
  stream.on('error', (err) => {
    hadError = err
  })
  stream.on('close', () => {
    if (!hadError) aw.unlink(filepath)
  })
  return stream
}
