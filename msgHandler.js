const axios = require("axios");
const steps = require("./src/steps/steps");
const TIMEOUT_DURATION = 5 * 60 * 1000;
const RESPONSE_DURATION = 20 * 1000;
let userTimeouts = {};
let responseTimeouts = {};

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

  const usuario = clients.find(vip => vip.id === numero);
  if (!usuario) {
    try {
      const response = await axios.post("http://localhost:3014/usuarios", {
        id: numero,
        numero: numero,
        step: 0,
        atendido: false
      });
      return response.data;
    } catch (error) {
      console.log("Erro ao cadastrar usuário:", error);
      return null;
    }
  }
  return usuario;
}

async function atualizarStepUsuario(numero, step) {
  try {
    const response = await axios.get(`http://localhost:3014/usuarios?numero=${numero}`);
    if (response.data.length > 0) {
      const usuario = response.data[0];
      await axios.put(`http://localhost:3014/usuarios/${usuario.id}`, { ...usuario, step });
    }
  } catch (error) {
    console.log("Erro ao atualizar step do usuário:", error);
  }
}

function extrairNumero(remoteJid) {
  return remoteJid.replace('@s.whatsapp.net', '');
}

function iniciarTimeoutResposta(client, remoteJid, numero, isClient) {
  if (responseTimeouts[remoteJid]) clearTimeout(responseTimeouts[remoteJid]);

  responseTimeouts[remoteJid] = setTimeout(async () => {
    await atualizarStepUsuario(numero, isClient ? 1 : 0);
    const msg = "Devido a sua ausência, irei finalizar nossa conversa. Pode me chamar novamente!";
    await client.sendMessage(remoteJid, { text: msg });
  }, RESPONSE_DURATION);
}

function setTimeoutForUser(remoteJid) {
  userTimeouts[remoteJid] = true;
  setTimeout(() => delete userTimeouts[remoteJid], TIMEOUT_DURATION);
}

module.exports = msgHandler = async (client, enviado) => {
  const { key, message } = enviado;
  const remoteJid = key.remoteJid;
  const numero = extrairNumero(remoteJid);
  const msg = message.conversation?.toLowerCase() || '';

  if (msg === 'sair') {
    await client.sendMessage(remoteJid, {
      text: "Você saiu do atendimento. Não receberá novas mensagens por 5 minutos."
    });
    setTimeoutForUser(remoteJid);
    return;
  }

  if (userTimeouts[remoteJid]) return;

  const usuario = await buscarOuCadastrarUsuario(numero);
  if (usuario.error) return console.log(usuario.error);

  let step = usuario.step || 0;

  if (step === 'espera_atendente') {
    await steps.espera_atendente(client, enviado);
    iniciarTimeoutResposta(client, remoteJid, numero, !!usuario);
    return;
  }

  let currentStep = steps[`step${step}`];
  console.log('current step= ', currentStep);

  try {
    if (currentStep) {
      await currentStep(client, enviado);
    } else {
      await steps.step0(client, enviado);
    }
    iniciarTimeoutResposta(client, remoteJid, numero, !!usuario);
  } catch (err) {
    console.log(`Erro no handler: ${err}`);
  }
};
