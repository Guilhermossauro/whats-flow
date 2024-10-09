<p align="center">
  <img src="https://github.com/Guilhermossauro/whats-flow/blob/main/logo.png" width="128" height="128"/>
</p>

<p align="center">
  <a href="#"><img title="Flows WhatsApp" src="https://img.shields.io/badge/Flows WhatsApp-blue?colorA=%23ff0000&colorB=%23017e40&style=for-the-badge"></a>
</p>

<p align="center">
  <a href="https://github.com/Guilhermossauro"><img title="Author" src="https://img.shields.io/badge/Author-Guilhermossauro-red.svg?style=for-the-badge&logo=github"></a>
</p>

<p align="center">
  <a href="https://github.com/Guilhermossauro/Baileys-Natsuki/followers"><img title="Followers" src="https://img.shields.io/github/followers/Guilhermossauro?color=blue&style=flat-square"></a>
  <a href="https://github.com/Guilhermossauro/Baileys-Natsuki/stargazers"><img title="Stars" src="https://img.shields.io/github/stars/Guilhermossauro/Baileys-Natsuki?color=red&style=flat-square"></a>
  <a href="https://github.com/Guilhermossauro/Baileys-Natsuki/network/members"><img title="Forks" src="https://img.shields.io/github/forks/Guilhermossauro/Baileys-Natsuki?color=red&style=flat-square"></a>
  <a href="https://github.com/Guilhermossauro/Baileys-Natsuki/watchers"><img title="Watchers" src="https://img.shields.io/github/watchers/Guilhermossauro/Baileys-Natsuki?label=Watchers&color=blue&style=flat-square"></a>
</p>


# Flows WhatsApp

## Sobre
O Flows WhatsApp é uma ferramenta para automatizar interações no WhatsApp usando um servidor JSON local para gerenciamento de usuários. O bot fornece recursos como fluxos de mensagens, filas de usuários e muito mais.

## Instalação

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/Guilhermossauro/whats-flow
cd whats-flow
```

### Passo 2: Instalar Dependências
Execute os seguintes comandos para instalar os pacotes necessários:
```bash
npm install
cd server
npm install
cd ..
```

### Passo 3: Configurar o Servidor Local
Este bot usa um servidor JSON local para armazenar usuários e os steps para serem configurados. Para iniciar o servidor em modo de desenvolvimento, execute:
```bash
npm run userServer
npm run stepServer
```

### Passo 4: Iniciar o Bot
Inicie o bot executando:
```bash
npm start
```

Você será solicitado a inserir um número de telefone (inclua o código do país e o DDD sem zeros à esquerda). Exemplo:
```bash
5527981254789
```
Em seguida, insira o código do WhatsApp exibido no terminal.

## Execução em Produção com PM2
Para rodar o bot em segundo plano, instale o PM2:
```bash
npm install -g pm2
pm2 start app.js --name Whats-flow
cd server
pm2 start stepServer.js --name stepsServer
pm2 start userServer.js --name userServer
cd ..
```


# Guia de Configuração de Etapas para o Bot

Este guia oferece uma visão clara de como criar e editar fluxos de etapas (steps) para seu bot. Você pode configurar novas etapas diretamente através do arquivo `steps.json`, localizado na pasta `server`, ou utilizar ferramentas como o Postman para enviar requisições POST para o servidor local em que o `stepsServer` está rodando.

## Estrutura de Configuração de Etapas

Cada etapa segue um formato específico, conforme o exemplo abaixo:

```json
{
  "step": 0,
  "text": "Olá, qual é o seu nome?",
  "hasOptions": false,
  "nextStep": 1
}
```

- `step`: Indica em qual etapa essa mensagem será exibida.
- `text`: Mensagem a ser apresentada ao usuário.
- `hasOptions`: Define se esta etapa possui múltiplas opções de resposta.
- `nextStep`: Indica o próximo passo a ser executado após esta etapa.

### Etapas com Múltiplas Opções

Se desejar configurar uma etapa com múltiplas opções para o usuário escolher, utilize o seguinte formato:

```json
{
  "step": 1,
  "text": "Olá! Como posso ajudar hoje?",
  "hasOptions": true,
  "options": [
    { "number": 1, "optext": "Suporte" },
    { "number": 2, "optext": "Cadastro" },
    { "number": 3, "optext": "Novidades" }
  ],
  "nextStep": 2
}
```

- `options`: Lista de opções disponíveis para o usuário, com o número correspondente e o texto descritivo.
- `optext`: Texto associado à opção e que direciona ao próximo passo do fluxo.

### Funções Associadas a Etapas

Caso uma etapa deva executar uma função, utilize o seguinte formato:

```json
{
  "step": "Cadastro",
  "text": "Seu cadastro foi iniciado.",
  "hasOptions": false,
  "isFunction": true,
  "functionName": "iniciarCadastro",
  "nextStep": 1
}
```

- `isFunction`: Define se essa etapa executará uma função.
- `functionName`: Nome da função a ser executada, localizada na pasta `src/steps/functions`.

### Exemplo de Função

Aqui está um exemplo de uma função que pode ser configurada na etapa:

```javascript
const { atualizarStepUsuario } = require("../../../fetch");

module.exports = async (client, message, usuario) => {
  const remoteJid = message.key.remoteJid;
  await client.sendMessage(remoteJid, { text: "Iniciando o processo de cadastro..." });
  await atualizarStepUsuario(usuario, 1);
};
```

Para criar sua própria função, adicione o arquivo na pasta `src/steps/functions` e siga o exemplo acima.




## Guia de Instalação no Linux

### 1. Instalar Node.js e npm:
```bash
sudo apt update
sudo apt install nodejs npm
```

### 2. Instalar as Dependências do Bot:
```bash
cd whats-flow
sudo npm install
cd server
npm install
cd ..
```

### 3. Iniciar o Bot:

```bash
node app.js
```

## Execução em Produção com PM2
instale o PM2:
```bash
npm install -g pm2
pm2 start app.js --name Whats-flow
cd server
pm2 start stepServer.js --name stepsServer
pm2 start userServer.js --name userServer
cd ..
```

## Autor
Criado por [Guilhermossauro](https://github.com/Guilhermossauro)
