// Prints a bcrypt hash for ADMIN_PASSWORD_HASH. The password is typed hidden and never stored.
import readline from 'node:readline'
import { Writable } from 'node:stream'
import bcrypt from 'bcryptjs'

let muted = false
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk, encoding)
    done()
  },
})
const rl = readline.createInterface({ input: process.stdin, output, terminal: true })

rl.question('Admin password (min 12 characters, hidden): ', async (password) => {
  rl.close()
  process.stdout.write('\n')
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password, 12)
  console.log('\nAdd this line to server/.env (keep the single quotes):\n')
  console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`)
})
muted = true
