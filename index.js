import crypto from 'crypto'
global.crypto = crypto

import fs from 'fs'
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'

const startSock = async () => {
  // Hapus auth_info kalau variable CLEAR_AUTH=true di Railway
  if (process.env.CLEAR_AUTH && fs.existsSync('./auth_info')) {
    fs.rmSync('./auth_info', { recursive: true, force: true })
    console.log('auth_info dihapus, reset pairing')
  }

  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Ubah jadi true biar muncul QR
    syncFullHistory: false
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\nScan QR ini di WhatsApp > Perangkat Tertaut > Tautkan Perangkat\n')
    }

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