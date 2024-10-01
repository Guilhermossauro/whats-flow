const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const msgHandler = require('./msgHandler');
const readline =require("readline")
const fs = require('fs');
const question = (string) =>{
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise((resolve) => rl.question(string, resolve))
  }
  async function loadingAnimation() {
    const spinner = ['|', '/', '-', '\\'];
    let i = 0;

    const loading = setInterval(() => {
        process.stdout.write(`\r${spinner[i]}`);
        i = (i + 1) % spinner.length;
    }, 250);

    await new Promise((resolve) => setTimeout(() => {
        clearInterval(loading);
        resolve();
    }, 3000));
}
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./_IGNORE_WhatsApp-Auth');
    const { version } = await fetchLatestBaileysVersion();

    const store = makeInMemoryStore({
        logger: P().child({ level: 'debug', stream: 'store' })
    });

    const client = makeWASocket({
        printQRInTerminal: false,
        version,
        logger: P({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
      });
      if (!client.authState.creds.registered) {
        let phoneNumber = await question("Informe o seu número de telefone: ");
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        if (!phoneNumber) {
            throw new Error("Número de telefone inválido!");
        }
        console.log("Solicitando código de pareamento...");
        await loadingAnimation();

        const code = await client.requestPairingCode(phoneNumber);

        console.log(`Código de pareamento: ${code}`);
    }

    store.bind(client.ev);
    client.ev.on('creds.update', saveCreds);

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada devido a', lastDisconnect.error, 'Tentando reconectar...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Conectado com sucesso!');
        } else if (qr) {
            qrcode.generate(qr, { small: true });
        }
    });
    client.ev.on('messages.upsert', async (msgUpdate) => {
        const message = msgUpdate.messages[0];
    const fromMe= message.key.fromMe
        if(fromMe){
            return
        }
        const isGroup = message.key.remoteJid.endsWith('@g.us');
        if (message.key.remoteJid === 'status@broadcast') return;
        if (msgUpdate.type !== 'notify') return;
        message.isGroup= isGroup
        if(isGroup){
            console.log('[IGNORING GROUP MESSAGE]')
            return
        }
        
        msgHandler(client,message)
    });
}

startBot().catch(console.error);
