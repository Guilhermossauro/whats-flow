const axios = require("axios");
const steps = require("./steps");
const TIMEOUT_DURATION = 5* 1000;
const userTimeouts = {};
async function mimetest(message) {
  const types = [
    { key: 'extendedTextMessage', mime: 'extendedTextMessage', command: msg => msg.extendedTextMessage.text },
    { key: 'protocolMessage', mime: 'protocolMessage', command: null },
    { key: 'reactionMessage', mime: 'reactionMessage', command: msg => msg.reactionMessage.key.text },
    { key: 'audioMessage', mime: 'audioMessage', command: null },
    { key: 'viewOnceMessageV2', mime: 'viewOnceMessageV2', command: null },
    { key: 'conversation', mime: 'conversation', command: msg => msg.conversation },
    { key: 'ephemeralMessage', mime: 'ephemeralMessage', command: msg => msg.ephemeralMessage.message.extendedTextMessage.text },
    { key: 'imageMessage', mime: 'imageMessage', command: msg => msg.imageMessage.caption },
    { key: 'stickerMessage', mime: 'stickerMessage', command: msg => msg.stickerMessage },
    { key: 'videoMessage', mime: 'videoMessage', command: msg => msg.videoMessage.caption },
  ];

  for (const type of types) {
    if (message[type.key]) {
      const command = typeof type.command === 'function' ? type.command(message) : null;
      return { mimetype: type.mime, command: command };
    }
  }

  console.log(`mimetest fail: ${JSON.stringify(message)}`);
  return { mimetype: 'error', command: null };
}
async function buscarUsuarios() {
  try {
    const response = await axios.get(`http://localhost:3014/usuarios/`);
    return response.data;
  } catch (error) {
    console.log("Erro ao buscar usuários:", error);
    return null;
  }
}
async function buscarOuCadastrarUsuario(numero) {
  let clients = await buscarUsuarios();
  if (!clients) return { error: "Erro ao buscar usuários" };
  const usuario = clients.find(cliente => cliente.id === numero);
  if (!usuario) {
    try {
        const response = await axios.post("http://localhost:3014/usuarios", {
        id: numero,
        numero: numero,
        step: 0,
        atendido: false
      });
      console.log('Cadastrado com sucesso');
      return response.data;
    } catch (error) {
      console.log("Erro ao cadastrar usuário:", error);
      return null;
    }
  }
  return usuario;
}
function resetUserTimeout(client, remoteJid) {
  if (userTimeouts[remoteJid]) {
    clearTimeout(userTimeouts[remoteJid]);
  }
  
  userTimeouts[remoteJid] = setTimeout(async () => {
    try {
      await client.sendMessage(remoteJid, {
        text: "Atendimento finalizado por inatividade. Se desejar, envie uma mensagem para iniciar um novo atendimento."
      });
    } catch (error) {
      console.log("Erro ao enviar mensagem de finalização:", error);
    }
  }, TIMEOUT_DURATION);
}

module.exports = msgHandler = async (client, enviado) => {
  try {
    const { key, message } = enviado;
    const mimetyped = await mimetest(message);

    if (mimetyped.mimetype === 'ephemeralMessage') {
      return;
    }

    if (mimetyped.mimetype === 'extendedTextMessage' || mimetyped.mimetype === 'conversation') {
      const remoteJid = key.remoteJid;
      const msg = mimetyped.command?.toLowerCase() || '';

      const usuario = await buscarOuCadastrarUsuario(remoteJid);
      if (usuario.error) return console.log(usuario.error);

      resetUserTimeout(client, remoteJid);  

      if (msg === 'sair') {
        console.log('Usuário disse sair');
        await client.sendMessage(remoteJid, {
          text: "Você saiu do atendimento. Para iniciar novamente, envie uma nova mensagem."
        });
        clearTimeout(userTimeouts[remoteJid]); 
        return;
      }

      enviado.mimetyped = mimetyped;
      await steps.processStep(client, enviado, usuario);

    } else {
      console.log("Mensagem com tipo não suportado:", mimetyped.mimetype);
    }

  } catch (err) {
    console.log('MsgHandler Error:', err);
  }
}
