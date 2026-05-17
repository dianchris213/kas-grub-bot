import crypto from 'crypto'
global.crypto = crypto

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question('Masukkan nomor WA kamu pakai 62xxx: ')
    const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''))
    console.log(`\nKode Pairing kamu: ${code}\nBuka WhatsApp > Linked Devices > Link with phone number > masukin kode ini`)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      console.log('Koneksi terputus, reconnect:', shouldReconnect)
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('Bot sudah terhubung!')
      rl.close()
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    const from = msg.key.remoteJid
    if (text === '!ping') {
      await sock.sendMessage(from, { text: 'Pong! Bot aktif ✅' })
    }
  })
}

startSock()