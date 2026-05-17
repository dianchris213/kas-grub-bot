import crypto from 'crypto'
global.crypto = crypto

import fs from 'fs'
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'

const startSock = async () => {
  // Auto hapus auth_info kalau corrupt biar reset bersih
  if (fs.existsSync('./auth_info')) {
    fs.rmSync('./auth_info', { recursive: true, force: true })
    console.log('Reset auth_info biar bersih')
  }

  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
    browser: ['Kas-Grub-Bot', 'Chrome', '122.0.0']
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n\n====== SCAN QR INI DI WHATSAPP ======\n')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log('Koneksi terputus. Kode:', statusCode, 'Reconnect:', shouldReconnect)
      if (shouldReconnect) startSock()
    } else if (connection === 'open') {
      console.log('✅ Bot sudah terhubung ke WhatsApp!')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startSock()