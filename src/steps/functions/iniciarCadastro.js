const { atualizarStepUsuario } = require("../../../fetch");

module.exports = async (client, message,usuario) => {
    const remoteJid = message.key.remoteJid;
    await client.sendMessage(remoteJid, { text: "Iniciando o processo de cadastro..." });
    await atualizarStepUsuario(usuario,1)
  };