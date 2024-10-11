const axios = require('axios');
const path = require('path');
const fs = require('fs');
const STEPS_URL = 'http://localhost:3421/steps'; 
const USER_URL= 'http://localhost:3014/usuarios'

// functions //
exports.atualizarStepUsuario = async function atualizarStepUsuario(cliente, novoStep) {
  try {
    const response = await axios.patch(`${USER_URL}/${cliente.numero}`,{step: novoStep});
    return response.data;
  } catch (error) {
    console.log("Erro ao atualizar step do usuário:", error);
    return null;
  }
}
exports.atualizarStatus = async function atualizarStatus(cliente, status=true) {
  try {
      const response = await axios.patch(`${USER_URL}/${cliente.numero}`,{atendido: status});
    return response.data;
  } catch (error) {
    console.log("Erro ao atualizar step do usuário:", error);
    return null;
  }
}
exports.getSteps = async function getSteps() {
  try {
    const response = await axios.get(`${STEPS_URL}`);
    return response.data;
  } catch (error) {
    console.log('Erro ao buscar steps:', error);
    return null;
  }
}

exports.getFunction =function getFunction(stepName) {
  const functionPath = path.join(__dirname,'src', 'steps','functions', `${stepName}.js`);
  if (fs.existsSync(functionPath)) {
    return require(functionPath);
  }
  return null;
}
