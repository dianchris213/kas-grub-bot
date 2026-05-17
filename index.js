import crypto from 'crypto'
global.crypto = crypto

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
    browser: ['Kas-Grub-Bot', 'Chrome', '122.0.0'] // biar keliatan normal di WA
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n\n====== SCAN QR INI DI WHATSAPP ======\n')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode!== DisconnectReason.loggedOut
      console.log('Koneksi terputus. Kode:', statusCode, 'Reconnect:', shouldReconnect)
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('✅ Bot sudah terhubung ke WhatsApp!')
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