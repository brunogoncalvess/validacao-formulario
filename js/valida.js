// const input = document.querySelector('#nascimento')

// input.onblur = (e) => dateValidate(e.target)

export function validate(input) {
  const inputType = input.dataset.tipo

  if (validators[inputType]) {
    validators[inputType](input)
  }

  if(input.validity.valid) {
    input.parentElement.classList.remove('input-container--invalido')
    input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
  } else {
      input.parentElement.classList.add('input-container--invalido')
      input.parentElement.querySelector('.input-mensagem-erro').innerHTML = showErrorMessage(inputType, input)
  }
}

const errorTypes = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'customError'
]

const errorMessages = {
  nome: {
      valueMissing: 'O campo de nome não pode estar vazio.'
  },
  email: {
      valueMissing: 'O campo de email não pode estar vazio.',
      typeMismatch: 'O email digitado não é válido.'
  },
  senha: {
      valueMissing: 'O campo de senha não pode estar vazio.',
      patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
  },
  dataNascimento: {
      valueMissing: 'O campo de data de nascimento não pode estar vazio.',
      customError: 'Você deve ser maior que 18 anos para se cadastrar.'
  },
  cpf: {
    valueMissing: 'O campo de CPF não pode estar vazio.',
    customError: 'O cpf digitado não é válido.'
  },
  cep: {
    valueMissing: 'O campo de CEP não pode estar vazio.',
    patternMismatch: 'O CEP digitado não é válido',
    customError: 'Não foi possível buscar o CEP'
  },
  logradouro: {
    valueMissing: 'O campo de logradouro não pode estar vazio.'
  },
  cidade: {
    valueMissing: 'O campo de cidade não pode estar vazio.'
  },
  estado: {
    valueMissing: 'O campo de estado não pode estar vazio.'
  },
  preco: {
    valueMissing: 'O campo de preço não pode estar vazio.'
  }
}

const showErrorMessage = (inputType, input) => {
  let message = ''
  errorTypes.forEach(err => {
    if (input.validity[err])
      message = errorMessages[inputType][err]
  })
  return message
}

const repeatedCPFcheck = (cpf) => {
  const repeatedValues = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ]

  let validCPF = true

  repeatedValues.forEach(value => {
    if (value == cpf) {
      validCPF = false
    }
  })

  return validCPF
}

const CPFValidate = (input) => {
  const cpfFormated = input.value.replace(/\D/g, '')
  let message = ''

  if (!repeatedCPFcheck(cpfFormated) || !checkStructure(cpfFormated)) {
    message = 'o CPF digitado não é valido.'
  }

  input.setCustomValidity(message)
}

function checkStructure(cpf) {
  const multiplier = 10

  return checkMultiplierDigit(cpf, multiplier)
}

function checkMultiplierDigit(cpf, multiplier) {
  if(multiplier >= 12) {
      return true
  }

  let initialMultiplier = multiplier
  let sum = 0
  const cpfWithoutDigit = cpf.substr(0, multiplier - 1).split('')
  const verifierDigit = cpf.charAt(multiplier - 1)
  for(let counter = 0; initialMultiplier > 1 ; initialMultiplier--) {
      sum = sum + cpfWithoutDigit[counter] * initialMultiplier
      counter++
  }

  if(verifierDigit == confirmDigit(sum)) {
      return checkMultiplierDigit(cpf, multiplier + 1)
  }

  return false
}

function confirmDigit(sum) {
  return 11 - (sum % 11)
}

const fetchCEP = async (input) => {
  const cep = input.value.replace(/\D/g, '')

  try {
    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
      
      const req = await fetch(`https://viacep.com.br/ws/${cep}/json`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'content-type': 'application/json;charset=utf-8'
        }
      })
      const data = await req.json()

      if (data.erro) {
        input.setCustomValidity('Não foi possível buscar o CEP.')
        return
      }

      input.setCustomValidity('')
      fillFieldsWithCEP(data)
      return

    }
  } catch (error) {
    console.log('fetchError::', error)  
  }
}

const fillFieldsWithCEP = data => {
  const logradouro = document.querySelector('[data-tipo="logradouro"]')
  const cidade = document.querySelector('[data-tipo="cidade"]')
  const estado = document.querySelector('[data-tipo="estado"]')

  logradouro.value = data.logradouro
  cidade.value = data.localidade
  estado.value = data.uf
}

const validators = {
  dataNascimento: input => dateValidate(input),
  cpf: input => CPFValidate(input),
  cep: input => fetchCEP(input)
}

const dateValidate = (input) => {
  const inputDate = new Date(input.value)
  let message = ''

  if (!olderThan18(inputDate)) {
    message = 'Você deve ter mais que 18 anos para se cadastrar.'
  }

  input.setCustomValidity(message)
}

const olderThan18 = (date) => {
  const currentDate = new Date()
  const plus18 = new Date(date.getUTCFullYear() + 18, date.getUTCMonth(), date.getUTCDay())
  
  return plus18 <= currentDate
}