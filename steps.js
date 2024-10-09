
/////////////////////////////////////////////////////////////////////////////////

const { atualizarStatus, getFunction, atualizarStepUsuario,getSteps } = require("./fetch");

exports.processStep= async function processStep (client,enviado,usuario){
  const { mimetyped } = enviado;
  const msg =mimetyped.command?.toLowerCase() || '';
  const {numero,step,atendido} = usuario
  const steps = await getSteps()
  if (!steps) return { error: "Erro ao buscar steps" }
  const userStep = steps.find(steps => steps.step === step);
  const hasOptions= userStep.hasOptions
  const isFunction = userStep?.isFunction ?? false;
  if(hasOptions){
    const {text,options}= userStep
    if (!atendido) {
      let message = `${text}\n`;
      options.forEach(option => {
        message += `${option.number} - ${option.optext}\n`;
      });
            await client.sendMessage(numero, {
        text: message
      });
      await atualizarStatus(usuario)
     return;
    }
    if (atendido) {
      const selectedOption = options.find(option => 
        option.number.toString() === msg || option.optext.toLowerCase() === msg
      );
      if (selectedOption) {
        const userStepOption = steps.find(step => step.step === selectedOption.optext);  
        if (userStepOption.isFunction && userStepOption.functionName) {
          const stepFunction = getFunction(userStepOption.functionName);
          if (stepFunction) {
            await stepFunction(client, enviado,usuario);  
          } else {
            await client.sendMessage(numero, {
              text: "A empresa não configurou corretamente a função."
            });
            return;
          }
        }   
        await atualizarStatus(usuario, false);
      
        if (!userStepOption.isFunction) {
          await client.sendMessage(numero, {
            text: userStepOption.text
          });
        }
      } else {
        await client.sendMessage(numero, {
          text: 'Opção inválida. Por favor, tente novamente.'
        });
      }
          return;
    }
  }
  if (isFunction && userStep.functionName) {
    const stepFunction = getFunction(userStep.functionName);
    if (stepFunction) {

      await stepFunction(client, enviado)
    } else {
      await client.sendMessage(numero, {
        text: "A empresa não configurou corretamente a função."
      });
      return;
    }
  }
 if(!hasOptions){
  const {text}= userStep
  await client.sendMessage(numero, {
    text: text
  });
await atualizarStepUsuario(usuario,userStep.nextStep)}
}