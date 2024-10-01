const axios = require("axios");

const atualizarStepUsuario = async (numero, step) => {
  try {
    const response = await axios.patch(`http://localhost:3014/usuarios/${numero}`, { step });
    return response.data;
  } catch (error) {
    console.log("Erro ao atualizar o step do usuário:", error);
    return null;
  }
};

const atualizarAtendidoUsuario = async (numero, atendido) => {
  try {
    const response = await axios.patch(`http://localhost:3014/usuarios/${numero}`, { atendido });
    return response.data;
  } catch (error) {
    console.log("Erro ao atualizar o status de atendimento do usuário:", error);
    return null;
  }
};
const buscarUsuarios = async () => {
  try {
    const response = await axios.get(`http://localhost:3014/usuarios/`);
    return response.data;
  } catch (error) {
    console.log("Erro ao buscar usuários:", error);
    return null;
  }
};

const cadastrarUsuario = async (id, usuario) => {
  try {
    const response = await axios.patch(`http://localhost:3014/usuarios/${id}`, {
      numero: usuario.numero,
      nome: usuario.nome
    });
    return response.data;
  } catch (error) {
    console.log("Erro ao cadastrar usuário:", error);
    return null;
  }
};

const verificarUsuario = async (numero, clients) => clients.find(vip => vip.id === numero);
const extrairNumero = remoteJid => remoteJid.replace('@s.whatsapp.net', '');
const enviarMensagem = async (client, remoteJid, texto) => {
  await client.sendMessage(remoteJid, { text: texto });
};

exports.step0 = async function step0(client, enviado) {
  const numero = extrairNumero(enviado.key.remoteJid);
  let clients = await buscarUsuarios();
  if (!clients) return;

  const usuario = await verificarUsuario(numero, clients);
  const saudacao = usuario && usuario.nome !== undefined ? 
  `Olá ${usuario.nome}, que bom te ver novamente! Vamos continuar de onde paramos.` :
  "Olá, tudo bem? Eu sou a Natsuki e estou aqui para ajudar.\nPara começar, qual o seu nome?";

  await enviarMensagem(client, enviado.key.remoteJid, saudacao);
      await atualizarStepUsuario(numero, usuario.step+1);
};

exports.step1 = async function step1(client, enviado) {
  const numero = extrairNumero(enviado.key.remoteJid);
  let clients = await buscarUsuarios();
  if (!clients) return;

  const usuario = await verificarUsuario(numero, clients);
  const nome = enviado.message.conversation.trim();

  if (usuario && usuario.nome !== 'placed' && usuario.nome !== undefined ) {
    await enviarMensagem(client, enviado.key.remoteJid, `Olá, ${usuario.nome}! Como posso te ajudar hoje?`);
  } else if (nome) {
    await cadastrarUsuario(numero, { numero, nome });
    await enviarMensagem(client, enviado.key.remoteJid, `Muito prazer, ${nome}! Você foi cadastrado em nosso banco de dados.`);
  } else {
    await enviarMensagem(client, enviado.key.remoteJid, "Desculpe, não consegui entender seu nome. Por favor, tente novamente.");
  }
  await atualizarStepUsuario(numero, usuario.step+1);
};

exports.step2 = async function step2(client, enviado) {
  const numero = extrairNumero(enviado.key.remoteJid);
  const nome = enviado.message.conversation.trim();

  if (!nome) {
    await enviarMensagem(client, enviado.key.remoteJid, "Desculpe, não consegui entender seu nome. Você pode repetir?");
    return;
  }

  let clients = await buscarUsuarios();
  if (!clients) return;

  const usuario = await verificarUsuario(numero, clients);
  
  if (!usuario || usuario.nome === 'placed') {
    const usuarioCadastrado = await cadastrarUsuario(numero, { nome, numero });
    if (usuarioCadastrado) {
      await enviarMensagem(client, enviado.key.remoteJid, `Que legal ter você aqui, ${nome}! Agora podemos continuar.`);
    } else {
      await enviarMensagem(client, enviado.key.remoteJid, "Desculpe, houve um erro ao cadastrar você. Tente novamente mais tarde.");
    }
  } else {
    await enviarMensagem(client, enviado.key.remoteJid, `Olá ${usuario.nome}, parece que você já está cadastrado! Como vai você?`);
  }
  await atualizarStepUsuario(numero, usuario.step+1);
};

exports.step3 = async function step3(client, enviado) {
  const numero = extrairNumero(enviado.key.remoteJid);
  let clients = await buscarUsuarios();
  const usuario = await verificarUsuario(numero, clients);
  await enviarMensagem(client, enviado.key.remoteJid, 
    "Okay, agora para eu poder te ajudar \nEscolha uma das opções:\n1 - Suporte\n2 - Cadastro\n3 - Novidades");
  await atualizarStepUsuario(extrairNumero(enviado.key.remoteJid),usuario.step+1);
};

exports.step4 = async function step4(client, enviado) {
  const { key, message } = enviado;
  const remoteJid = key.remoteJid;
  const numero = extrairNumero(remoteJid);
  
  const msg = message.conversation?.trim();
  console.log(msg)

  if (!msg) {
    await enviarMensagem(client, remoteJid, 
      "Escolha uma das opções:\n1 - Suporte\n2 - Cadastro\n3 - Novidades");
    return;
  }

  switch (msg) {
    case '1':
      await enviarMensagem(client, remoteJid, 
        "Okay, qual seria o problema que você está tendo? Vou transferir para um atendente.");
      await atualizarStepUsuario(numero, 'espera_atendente');
      break;
      
    case '2':
      await enviarMensagem(client, remoteJid, 
        "Okay, vou falar aqui com a minha equipe para te ajudar nisso.");
      await atualizarStepUsuario(numero, 'espera_atendente');
      break;
      
    case '3':
      await enviarMensagem(client, remoteJid, 
        "Opa, não temos nenhuma novidade por agora. Volte mais tarde!");
      await atualizarStepUsuario(numero, 1); 
      break;
      
    default:
      await enviarMensagem(client, remoteJid, 
        "Escolha inválida. Por favor, responda com 1, 2 ou 3.");
  }
};

exports.espera_atendente = async function espera_atendente(client, enviado) {
  const { key, message } = enviado;
  const remoteJid = key.remoteJid;
  const numero = extrairNumero(remoteJid);

  let clients = await buscarUsuarios();
  if (!clients) return;

  const usuario = await verificarUsuario(numero, clients);

   if (usuario && usuario.atendido) {
    console.log("Usuário já foi atendido, não será enviado outro aviso.");
    if (message.conversation?.toLowerCase() === 'reiniciar') {
      await enviarMensagem(client, remoteJid, "Reiniciando a conversa...");
      await atualizarStepUsuario(numero, 1);
      await atualizarAtendidoUsuario(numero, false); 
    }
    return;
  }

  if (message.conversation?.toLowerCase() === 'reiniciar') {
    await enviarMensagem(client, remoteJid, "Reiniciando a conversa...");
    await atualizarStepUsuario(numero, 1);
    await atualizarAtendidoUsuario(numero, false); 
  } else {
    await enviarMensagem(client, remoteJid, 
      "Você está na fila para falar com um atendente. Digite 'reiniciar' se deseja recomeçar a conversa.");

    await atualizarAtendidoUsuario(numero, true);
  }
};