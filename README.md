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



# Whats-Flow

## Descrição Geral

Whats-Flow é uma ferramenta de automação de mensagens do WhatsApp, projetada para criar fluxos de conversação dinâmicos com base em etapas configuráveis. Ele permite o envio e o recebimento de mensagens através de um bot, personalizando interações de acordo com a necessidade do usuário.

## Funcionalidades Principais
- Criação e edição de etapas de fluxo de conversas diretamente através de arquivos JSON ou uma API.
- Suporte a múltiplas opções de resposta para os usuários, permitindo criar caminhos dinâmicos no fluxo de mensagens.
- Execução de funções personalizadas associadas a etapas específicas.
- Fácil integração com a API do WhatsApp para automação de respostas.

## Arquitetura e Fluxo de Funcionamento

O Whats-Flow funciona em torno de um sistema de etapas (*steps*), onde cada mensagem enviada ao usuário corresponde a uma etapa no fluxo de conversação. As etapas podem ser configuradas com ou sem opções, e também podem acionar funções específicas que processam a lógica adicional.

### Fluxo Básico:
1. O usuário interage com o bot.
2. O sistema identifica o *step* atual do usuário e envia a mensagem correspondente.
3. Caso o *step* tenha opções, o usuário faz a seleção e o sistema processa a resposta.
4. Dependendo da escolha do usuário, o próximo *step* é carregado, ou uma função personalizada é executada.

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter os seguintes requisitos instalados:
- **Node.js** (versão 14 ou superior)
- **npm** (Gerenciador de pacotes do Node.js)

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/Guilhermossauro/whats-flow.git
    ```

2. Navegue até o diretório do projeto:
    ```bash
    cd whats-flow
    ```

3. Instale as dependências:
    ```bash
    npm install
    ```

4. Configurar o Servidor Local
Este bot usa um servidor JSON local para armazenar usuários e os steps para serem configurados. Para iniciar o servidor em modo de desenvolvimento, execute:
```bash
npm run userServer
npm run stepServer
```

5. Inicie o servidor:
    ```bash
    npm start
    ```

## Configurando Etapas de Conversa (Steps)

Você pode configurar os fluxos de conversas editando o arquivo `steps.json` localizado na pasta `server`, ou criando novas etapas através de requisições POST utilizando ferramentas como o Postman.

### Exemplo de Configuração de Step Básico

```json
{
    "step": 0,
    "text": "Olá, qual é o seu nome?",
    "hasOptions": false,
    "nextStep": 1
}
```
- `step`: Identifica o número da etapa no fluxo de conversação.
- `text`: A mensagem que será enviada ao usuário.
- `hasOptions`: Define se esta etapa possui múltiplas opções para o usuário selecionar.
- `nextStep`: Especifica qual será o próximo *step* após este ser processado.

### Exemplo de Step com Múltiplas Opções

```json
{
    "step": 1,
    "text": "Como posso ajudar hoje?",
    "hasOptions": true,
    "options": [
        { "number": 1, "optext": "Suporte" },
        { "number": 2, "optext": "Cadastro" },
        { "number": 3, "optext": "Novidades" }
    ],
    "nextStep": 2
}
```
- `options`: Lista de opções que o usuário pode selecionar. Cada opção tem um número associado e um texto (`optext`) que descreve a escolha.

## Funções Personalizadas

Se um *step* tiver a opção `isFunction` como `true`, uma função personalizada será chamada para lidar com a etapa. Essas funções devem ser criadas dentro da pasta `src/steps/functions/`.

### Exemplo de Função Personalizada

```javascript
const { atualizarStepUsuario } = require("../../../fetch");

module.exports = async (client, message, usuario) => {
    const remoteJid = message.key.remoteJid;
    await client.sendMessage(remoteJid, { text: "Iniciando o processo de cadastro..." });
    await atualizarStepUsuario(usuario, 1);
};
```
- `client.sendMessage`: Envia uma mensagem ao usuário.
- `atualizarStepUsuario`: Atualiza o *step* do usuário no banco de dados ou servidor.

## Contribuições

Contribuições são bem-vindas! Siga estas etapas para contribuir com o projeto:
1. Faça um *fork* do repositório.
2. Crie um *branch* para sua funcionalidade: `git checkout -b feature-minha-funcionalidade`.
3. Faça o commit das suas mudanças: `git commit -m 'Minha nova funcionalidade'`.
4. Envie suas alterações para o repositório remoto: `git push origin feature-minha-funcionalidade`.
5. Abra um *pull request*.

## Licença

Este projeto está licenciado sob os termos da licença MIT. Consulte o arquivo `LICENSE` para mais informações.


Sinta-se à vontade para ajustar ou estender o sistema de *steps* conforme necessário para o seu projeto. O Whats-Flow é altamente configurável, permitindo criar fluxos de interação personalizados que atendem a diversas necessidades.
