function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

function sanitizeExpression(expression: string) {
  return expression.replace(/\s+/g, '')
}

function tokenizeExpression(expression: string) {
  const sanitized = sanitizeExpression(expression)
  if (!sanitized) {
    return []
  }

  const tokens = sanitized.match(/(\d+\.\d+|\d+\.|\.\d+|\d+|[+\-*/])/g)

  return tokens ?? []
}

function evaluateTokens(tokens: string[]) {
  if (tokens.length === 0) {
    return 0
  }

  const normalizedTokens = [...tokens]
  if (['+', '-', '*', '/'].includes(normalizedTokens.at(-1) ?? '')) {
    normalizedTokens.pop()
  }

  if (normalizedTokens.length === 0) {
    return 0
  }

  const values: number[] = []
  const operators: string[] = []

  const precedence = (operator: string) => (operator === '+' || operator === '-' ? 1 : 2)

  const applyOperator = () => {
    const operator = operators.pop()
    const right = values.pop()
    const left = values.pop()

    if (!operator || right === undefined || left === undefined) {
      return
    }

    switch (operator) {
      case '+':
        values.push(left + right)
        break
      case '-':
        values.push(left - right)
        break
      case '*':
        values.push(left * right)
        break
      case '/':
        values.push(right === 0 ? 0 : left / right)
        break
    }
  }

  normalizedTokens.forEach((token) => {
    if (['+', '-', '*', '/'].includes(token)) {
      while (
        operators.length > 0 &&
        precedence(operators[operators.length - 1]) >= precedence(token)
      ) {
        applyOperator()
      }

      operators.push(token)
      return
    }

    const parsed = Number.parseFloat(token)
    values.push(Number.isFinite(parsed) ? parsed : 0)
  })

  while (operators.length > 0) {
    applyOperator()
  }

  return values[0] ?? 0
}

export function parseAmount(raw: string) {
  const value = evaluateTokens(tokenizeExpression(raw))
  return Number.isFinite(value) ? Math.max(value, 0) : 0
}

export function parseAmountToCents(raw: string) {
  return Math.round(parseAmount(raw) * 100)
}

export function formatAmountDisplay(raw: string) {
  return formatCurrency(parseAmount(raw))
}

export function formatExpressionPreview(raw: string) {
  if (!raw.trim()) {
    return '0'
  }

  return raw
    .replaceAll('*', ' x ')
    .replaceAll('/', ' / ')
    .replaceAll('+', ' + ')
    .replaceAll('-', ' - ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function appendCalculatorInput(current: string, next: string) {
  const sanitized = sanitizeExpression(current)
  const tokens = tokenizeExpression(sanitized)
  const lastToken = tokens.at(-1) ?? ''
  const lastChar = sanitized.at(-1) ?? ''
  const operators = ['+', '-', '*', '/']

  if (next === '=') {
    return parseAmount(sanitized).toFixed(2).replace(/\.00$/, '')
  }

  if (operators.includes(next)) {
    if (!sanitized) {
      return '0'
    }

    if (operators.includes(lastChar)) {
      return `${sanitized.slice(0, -1)}${next}`
    }

    return `${sanitized}${next}`
  }

  if (next === '.') {
    if (!sanitized || operators.includes(lastChar)) {
      return `${sanitized}0.`
    }

    if (lastToken.includes('.')) {
      return sanitized
    }

    return `${sanitized}.`
  }

  if (!sanitized || sanitized === '0') {
    return next
  }

  if (operators.includes(lastChar) && next === '0') {
    return `${sanitized}0`
  }

  return `${sanitized}${next}`
}

export function backspaceCalculatorInput(current: string) {
  return sanitizeExpression(current).slice(0, -1)
}
