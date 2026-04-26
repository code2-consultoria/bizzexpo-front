import { test, expect, Page } from '@playwright/test'

// Credenciais para teste (OrganizadorSeeder)
const ORGANIZADOR_EMAIL = process.env.TEST_EMAIL || 'organizador@example.com'
const ORGANIZADOR_PASSWORD = process.env.TEST_PASSWORD || 'password'

// Helper para fazer login
async function fazerLogin(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('form')
  await page.waitForTimeout(1000)

  const emailInput = page.locator('input[type="email"]')
  await emailInput.click({ force: true })
  await emailInput.fill(ORGANIZADOR_EMAIL, { force: true })

  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.click({ force: true })
  await passwordInput.fill(ORGANIZADOR_PASSWORD, { force: true })

  const responsePromise = page.waitForResponse(
    (resp) => resp.url().includes('/api/login') && resp.request().method() === 'POST',
    { timeout: 10000 }
  )

  await page.getByRole('button', { name: 'Entrar' }).click()

  const response = await responsePromise
  const status = response.status()

  if (status === 401) {
    throw new Error(`Login falhou: credenciais invalidas (401)`)
  }

  if (status >= 400) {
    throw new Error(`Login falhou com status ${status}`)
  }

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
}

// Helper para obter eventoId do dashboard
async function obterEventoId(page: Page): Promise<string | null> {
  await page.goto('/dashboard')
  await page.waitForTimeout(2000)

  const eventoLink = page.locator('a[href*="/eventos/"]').first()

  if (await eventoLink.isVisible()) {
    const href = await eventoLink.getAttribute('href')
    return href?.match(/eventos\/([a-f0-9-]+)/)?.[1] || null
  }

  return null
}

// Gera CNPJ valido para testes
function gerarCnpjValido(): string {
  const numeros = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))

  const multiplicadores1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += numeros[i] * multiplicadores1[i]
  }
  let resto = soma % 11
  numeros.push(resto < 2 ? 0 : 11 - resto)

  const multiplicadores2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += numeros[i] * multiplicadores2[i]
  }
  resto = soma % 11
  numeros.push(resto < 2 ? 0 : 11 - resto)

  return numeros.join('')
}

// Gera CPF valido para testes
function gerarCpfValido(): string {
  const numeros = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += numeros[i] * (10 - i)
  }
  let resto = (soma * 10) % 11
  numeros.push(resto === 10 || resto === 11 ? 0 : resto)

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += numeros[i] * (11 - i)
  }
  resto = (soma * 10) % 11
  numeros.push(resto === 10 || resto === 11 ? 0 : resto)

  return numeros.join('')
}

test.describe('Cadastro de Expositor - Nova UX', () => {
  test.beforeEach(async ({ page }) => {
    await fazerLogin(page)
  })

  test('deve exibir selecao de tipo de documento na tela inicial', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Verifica titulo
    await expect(page.getByText(/Novo expositor/i)).toBeVisible({ timeout: 5000 })

    // Verifica botoes de selecao CPF e CNPJ
    await expect(page.getByRole('button', { name: /CPF/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /CNPJ/i })).toBeVisible()
  })

  test('deve navegar para busca de CPF ao selecionar', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Clica em CPF
    await page.getByRole('button', { name: /CPF/i }).click()
    await page.waitForTimeout(500)

    // Verifica que mudou para tela de busca
    await expect(page.getByText(/Buscar por CPF/i)).toBeVisible()

    // Verifica que o input de documento apareceu
    await expect(page.locator('input[placeholder*="000.000.000-00"]')).toBeVisible()
  })

  test('deve navegar para busca de CNPJ ao selecionar', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Clica em CNPJ
    await page.getByRole('button', { name: /CNPJ/i }).click()
    await page.waitForTimeout(500)

    // Verifica que mudou para tela de busca
    await expect(page.getByText(/Buscar por CNPJ/i)).toBeVisible()

    // Verifica que o input de documento apareceu
    await expect(page.locator('input[placeholder*="00.000.000/0000-00"]')).toBeVisible()
  })

  test('deve aplicar mascara no input de CPF', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /CPF/i }).click()
    await page.waitForTimeout(500)

    const input = page.locator('input[placeholder*="000.000.000-00"]')
    await input.fill('12345678901')
    await page.waitForTimeout(500)

    // Verifica que a mascara foi aplicada
    const valor = await input.inputValue()
    expect(valor).toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
  })

  test('deve aplicar mascara no input de CNPJ', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /CNPJ/i }).click()
    await page.waitForTimeout(500)

    const input = page.locator('input[placeholder*="00.000.000/0000-00"]')
    await input.fill('12345678000190')
    await page.waitForTimeout(500)

    // Verifica que a mascara foi aplicada
    const valor = await input.inputValue()
    expect(valor).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)
  })

  test('deve mostrar formulario editavel quando CPF nao encontrado', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CPF
    await page.getByRole('button', { name: /CPF/i }).click()
    await page.waitForTimeout(500)

    // Gera CPF valido que provavelmente nao existe
    const cpf = gerarCpfValido()

    // Mock da resposta 404 para pessoa nao encontrada
    await page.route('**/pessoas/buscar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Pessoa não encontrada' }),
      })
    })

    // Digita o CPF
    const input = page.locator('input[placeholder*="000.000.000-00"]')
    await input.fill(cpf)
    await input.press('Enter')

    await page.waitForTimeout(2000)

    // Verifica que o formulario editavel apareceu
    await expect(page.getByText(/Cadastrar expositor/i)).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#nome_empresa')).toBeVisible()
  })

  test('deve consultar Receita Federal quando CNPJ nao encontrado localmente', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CNPJ
    await page.getByRole('button', { name: /CNPJ/i }).click()
    await page.waitForTimeout(500)

    // Mock: pessoa nao encontrada localmente
    await page.route('**/pessoas/buscar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Pessoa não encontrada' }),
      })
    })

    // Mock: CNPJ encontrado na Receita
    await page.route('**/cnpj/consultar**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            cnpj: '12.345.678/0001-90',
            razao_social: 'EMPRESA TESTE LTDA',
            nome_fantasia: 'Empresa Teste',
            situacao_cadastral: 'ATIVA',
            endereco: {
              logradouro: 'Rua Teste',
              numero: '100',
              complemento: null,
              bairro: 'Centro',
              municipio: 'São Paulo',
              uf: 'SP',
              cep: '01310-100',
            },
            telefone: '(11) 3333-4444',
            email: 'contato@empresateste.com.br',
          },
        }),
      })
    })

    // Digita o CNPJ
    const input = page.locator('input[placeholder*="00.000.000/0000-00"]')
    await input.fill('12345678000190')
    await input.press('Enter')

    await page.waitForTimeout(2000)

    // Verifica que mostrou o card com dados da Receita
    await expect(page.getByText(/Empresa encontrada na Receita Federal/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/EMPRESA TESTE LTDA/i)).toBeVisible()
    await expect(page.getByText(/ATIVA/i)).toBeVisible()
  })

  test('deve mostrar erro quando CNPJ nao encontrado na Receita', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CNPJ
    await page.getByRole('button', { name: /CNPJ/i }).click()
    await page.waitForTimeout(500)

    // Mock: pessoa nao encontrada localmente
    await page.route('**/pessoas/buscar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Pessoa não encontrada' }),
      })
    })

    // Mock: CNPJ nao encontrado na Receita
    await page.route('**/cnpj/consultar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'CNPJ não encontrado na Receita Federal' }),
      })
    })

    // Digita o CNPJ
    const cnpj = gerarCnpjValido()
    const input = page.locator('input[placeholder*="00.000.000/0000-00"]')
    await input.fill(cnpj)
    await input.press('Enter')

    await page.waitForTimeout(2000)

    // Verifica mensagem de erro
    await expect(page.getByText(/não encontrado na Receita/i)).toBeVisible({ timeout: 5000 })

    // Deve mostrar formulario para preenchimento manual
    await expect(page.locator('#nome_empresa')).toBeVisible()
  })

  test('deve preencher formulario com dados da Receita e permitir editar campos de contato', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CNPJ
    await page.getByRole('button', { name: /CNPJ/i }).click()
    await page.waitForTimeout(500)

    // Mock: pessoa nao encontrada localmente
    await page.route('**/pessoas/buscar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Pessoa não encontrada' }),
      })
    })

    // Mock: CNPJ encontrado na Receita
    await page.route('**/cnpj/consultar**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            cnpj: '12.345.678/0001-90',
            razao_social: 'EMPRESA TESTE LTDA',
            nome_fantasia: 'Empresa Teste',
            situacao_cadastral: 'ATIVA',
            endereco: {
              logradouro: 'Rua Teste',
              numero: '100',
              complemento: null,
              bairro: 'Centro',
              municipio: 'São Paulo',
              uf: 'SP',
              cep: '01310-100',
            },
            telefone: '(11) 3333-4444',
            email: 'contato@empresateste.com.br',
          },
        }),
      })
    })

    // Digita o CNPJ
    const input = page.locator('input[placeholder*="00.000.000/0000-00"]')
    await input.fill('12345678000190')
    await input.press('Enter')

    await page.waitForTimeout(2000)

    // Clica em continuar
    await page.getByRole('button', { name: /Continuar com estes dados/i }).click()
    await page.waitForTimeout(1000)

    // Verifica que o campo nome_empresa esta preenchido e desabilitado
    const nomeEmpresaInput = page.locator('#nome_empresa')
    await expect(nomeEmpresaInput).toHaveValue(/Empresa Teste/i)
    await expect(nomeEmpresaInput).toBeDisabled()

    // Verifica que campos de contato estao editaveis
    const nomeContatoInput = page.locator('#nome_contato')
    await expect(nomeContatoInput).not.toBeDisabled()

    // Preenche campos de contato
    await nomeContatoInput.fill('João da Silva')
    await page.locator('#email_contato').fill('joao@empresateste.com.br')
  })

  test('deve criar expositor com sucesso apos preencher formulario', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CPF
    await page.getByRole('button', { name: /CPF/i }).click()
    await page.waitForTimeout(500)

    // Mock: pessoa nao encontrada
    await page.route('**/pessoas/buscar**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Pessoa não encontrada' }),
      })
    })

    // Mock: criacao de expositor
    await page.route('**/expositores', (route, request) => {
      if (request.method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'novo-expositor-id',
              nome_empresa: 'Nova Empresa Teste',
              cnpj: null,
              nome_contato: 'Contato Teste',
              email_contato: 'contato@teste.com',
              telefone: '(11) 99999-8888',
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    // Digita CPF
    const cpf = gerarCpfValido()
    const input = page.locator('input[placeholder*="000.000.000-00"]')
    await input.fill(cpf)
    await input.press('Enter')

    await page.waitForTimeout(2000)

    // Preenche formulario
    await page.locator('#nome_empresa').fill('Nova Empresa Teste')
    await page.locator('#nome_contato').fill('Contato Teste')
    await page.locator('#email_contato').fill('contato@teste.com')
    await page.locator('#telefone').fill('11999998888')

    // Envia formulario
    await page.getByRole('button', { name: /Adicionar expositor/i }).click()

    await page.waitForTimeout(2000)

    // Verifica redirecionamento para lista de expositores
    await expect(page.url()).toContain('/expositores')
  })

  test('deve permitir voltar para selecao de tipo de documento', async ({ page }) => {
    const eventoId = await obterEventoId(page)
    if (!eventoId) {
      test.skip()
      return
    }

    await page.goto(`/eventos/${eventoId}/expositores/criar`)
    await page.waitForTimeout(1000)

    // Seleciona CPF
    await page.getByRole('button', { name: /CPF/i }).click()
    await page.waitForTimeout(500)

    // Verifica que esta na tela de busca
    await expect(page.getByText(/Buscar por CPF/i)).toBeVisible()

    // Clica no botao de voltar
    await page.locator('button svg path[d*="15 19l-7-7"]').click()
    await page.waitForTimeout(500)

    // Verifica que voltou para selecao de tipo
    await expect(page.getByText(/Novo expositor/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /CPF/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /CNPJ/i })).toBeVisible()
  })
})
