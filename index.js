import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeySockets/baileys'
import qrcode from 'qrcode-terminal'
import fs from 'fs'

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false // kita handle manual pakai qrcode-terminal
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('Scan QR ini di WhatsApp kamu:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
      console.log('Koneksi terputus, reconnect:', shouldReconnect)
      if (shouldReconnect) {
        startSock()
      }
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

    if (text === '!kas') {
      await sock.sendMessage(from, { text: 'Fitur kas belum diisi, edit file index.js ini ya' })
    }
  })
}

startSock()