import crypto from 'crypto'
global.crypto = crypto

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  // Pakai nomor dari Railway Environment Variable
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER
    if (!phoneNumber) {
      console.log('Error: Set PHONE_NUMBER di Railway Variables dulu!')
      process.exit(1)
    }
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