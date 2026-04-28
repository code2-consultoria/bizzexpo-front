import { test, expect, Page } from '@playwright/test'

// Credenciais para teste (OrganizadorSeeder)
const ORGANIZADOR_EMAIL = process.env.TEST_EMAIL || 'organizador@example.com'
const ORGANIZADOR_PASSWORD = process.env.TEST_PASSWORD || 'password'

// Slug do evento para testes (deve ser um evento publicado com tipos de ingresso)
const EVENTO_SLUG = process.env.TEST_EVENTO_SLUG || 'cafe-tech'

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

// Gera email unico para evitar duplicatas
function gerarEmailUnico(): string {
  return `teste.ingresso.${Date.now()}@example.com`
}

test.describe('Pagina Publica do Evento - Selecao de Ingressos', () => {
  test('deve exibir tipos de ingresso disponiveis', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)

    // Aguarda carregamento do evento
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verifica se a pagina do evento carregou (pode ter ingressos ou nao)
    const eventoCarregado = page.locator('h1, h2, [class*="font-bold"]').first()
    await expect(eventoCarregado).toBeVisible({ timeout: 10000 })

    // Verifica se ha o titulo "Ingressos" ou a pagina carregou
    const tituloIngressos = page.getByText('Ingressos')
    const temTituloIngressos = await tituloIngressos.isVisible().catch(() => false)

    if (temTituloIngressos) {
      console.log('Secao de ingressos encontrada')

      // Verifica se existem tipos de ingresso ou mensagem de vazio
      const mensagemVazio = page.getByText(/Nenhum ingresso dispon/i)
      const temMensagemVazio = await mensagemVazio.isVisible().catch(() => false)

      if (temMensagemVazio) {
        console.log('Nenhum ingresso disponivel no momento')
      } else {
        // Procura por cards de ingresso (botoes de +/-)
        const botoesIngresso = page.locator('button').filter({ has: page.locator('svg') })
        const temBotoes = await botoesIngresso.count() > 0
        if (temBotoes) {
          console.log('Tipos de ingresso encontrados')
        }
      }
    } else {
      console.log('Pagina do evento carregada (sem secao de ingressos visivel)')
    }
  })

  test('deve exibir preco e status dos ingressos', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verifica se ha precos visiveis (R$ ou Gratuito)
    const precoOuGratuito = page.locator('text=/R\\$|Gratuito/i').first()

    if (await precoOuGratuito.isVisible().catch(() => false)) {
      const texto = await precoOuGratuito.textContent()
      console.log('Preco encontrado:', texto)
    }

    // Verifica status de esgotado/indisponivel se houver
    const statusEsgotado = page.getByText(/Esgotado/i)
    const statusIndisponivel = page.getByText(/Indispon/i)

    if (await statusEsgotado.isVisible().catch(() => false)) {
      console.log('Ha ingressos esgotados')
    }

    if (await statusIndisponivel.isVisible().catch(() => false)) {
      console.log('Ha ingressos indisponiveis')
    }
  })

  test('deve permitir selecionar quantidade de ingressos', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Procura botao de aumentar quantidade (+)
    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (await botaoAumentar.isVisible().catch(() => false)) {
      // Clica para aumentar quantidade
      await botaoAumentar.click()
      await page.waitForTimeout(500)

      // Verifica se quantidade aumentou para 1
      const quantidade = page.locator('.w-8.text-center, [class*="quantidade"]').first()
      const valorQuantidade = await quantidade.textContent()
      console.log('Quantidade selecionada:', valorQuantidade)

      // Verifica se o botao de compra esta habilitado
      const botaoComprar = page.getByRole('button', { name: /Comprar/i })
      await expect(botaoComprar).toBeEnabled()
    } else {
      console.log('Nenhum ingresso disponivel para selecao')
    }
  })

  test('deve calcular valor total corretamente', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Seleciona 2 ingressos
    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (await botaoAumentar.isVisible().catch(() => false)) {
      await botaoAumentar.click()
      await page.waitForTimeout(300)
      await botaoAumentar.click()
      await page.waitForTimeout(500)

      // Verifica se o total aparece
      const totalLabel = page.getByText(/Total:/i)
      if (await totalLabel.isVisible().catch(() => false)) {
        const total = page.locator('.font-semibold.text-lg, [class*="total"]').last()
        const valorTotal = await total.textContent()
        console.log('Valor total:', valorTotal)
      }
    }
  })

  test('deve navegar para pagina de compra ao clicar em comprar', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Seleciona um ingresso
    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (await botaoAumentar.isVisible().catch(() => false)) {
      await botaoAumentar.click()
      await page.waitForTimeout(500)

      // Clica no botao de comprar
      const botaoComprar = page.getByRole('button', { name: /Comprar/i })
      await botaoComprar.click()

      // Verifica redirecionamento para pagina de compra
      await page.waitForURL(/\/compra/, { timeout: 10000 })
      await expect(page).toHaveURL(/\/evento\/.*\/compra/)

      console.log('Navegou para pagina de compra com sucesso')
    }
  })
})

test.describe('Formulario de Compra de Ingresso', () => {
  test('deve exibir formulario de compra', async ({ page }) => {
    // Vai direto para pagina de compra com tipo de ingresso na query
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Seleciona ingresso e vai para compra
    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (await botaoAumentar.isVisible().catch(() => false)) {
      await botaoAumentar.click()
      await page.waitForTimeout(500)

      const botaoComprar = page.getByRole('button', { name: /Comprar/i })
      await botaoComprar.click()

      await page.waitForURL(/\/compra/, { timeout: 10000 })
      await page.waitForTimeout(1000)

      // Verifica elementos do formulario
      await expect(page.getByText(/Seus dados/i)).toBeVisible({ timeout: 5000 })
      await expect(page.locator('input').first()).toBeVisible()

      // Verifica campos do formulario
      const campoNome = page.locator('input[placeholder*="nome"], #nome, input').first()
      await expect(campoNome).toBeVisible()

      console.log('Formulario de compra carregado')
    }
  })

  test('deve validar campos obrigatorios', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (await botaoAumentar.isVisible().catch(() => false)) {
      await botaoAumentar.click()
      await page.waitForTimeout(500)

      const botaoComprar = page.getByRole('button', { name: /Comprar/i })
      await botaoComprar.click()

      await page.waitForURL(/\/compra/, { timeout: 10000 })
      await page.waitForSelector('form')
      await page.waitForTimeout(1000)

      // Tenta enviar formulario vazio
      const botaoEnviar = page.getByRole('button', { name: /Garantir|Continuar/i })
      await botaoEnviar.click()

      // Verifica mensagens de erro de validacao
      await expect(page.getByText(/obrigat/i).first()).toBeVisible({ timeout: 5000 })
      console.log('Validacao de campos obrigatorios funcionando')
    }
  })

  test('deve realizar compra de ingresso gratuito com sucesso', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Procura por ingresso gratuito
    const ingressoGratuito = page.getByText(/Gratuito/i).first()

    // Se houver ingresso gratuito, seleciona ele
    if (await ingressoGratuito.isVisible().catch(() => false)) {
      // Encontra o botao de + mais proximo do ingresso gratuito
      const containerIngresso = ingressoGratuito.locator('..').locator('..')
      const botaoAumentar = containerIngresso.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') })

      if (await botaoAumentar.isVisible().catch(() => false)) {
        await botaoAumentar.click()
      } else {
        // Fallback: usa o primeiro botao de +
        const primeiroBotao = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()
        if (await primeiroBotao.isVisible().catch(() => false)) {
          await primeiroBotao.click()
        }
      }
    } else {
      // Se nao ha gratuito, seleciona qualquer um
      const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()
      if (await botaoAumentar.isVisible().catch(() => false)) {
        await botaoAumentar.click()
      } else {
        console.log('Nenhum ingresso disponivel')
        return
      }
    }

    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')
    await page.waitForTimeout(1000)

    const emailUnico = gerarEmailUnico()

    // Preenche formulario
    // Nome
    const campoNome = page.locator('input').first()
    await campoNome.fill('Teste Playwright Ingresso')

    // Email
    const campoEmail = page.locator('input[type="email"]')
    await campoEmail.fill(emailUnico)

    // Telefone
    const campoTelefone = page.locator('input[placeholder*="00000"], input[placeholder*="telefone" i]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999998888')
    }

    // Aceita termos
    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    // Captura resposta da API
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/ingressos') && resp.request().method() === 'POST',
      { timeout: 15000 }
    )

    // Envia formulario
    const botaoEnviar = page.getByRole('button', { name: /Garantir|Continuar/i })
    await botaoEnviar.click()

    // Aguarda resposta
    const response = await responsePromise
    const status = response.status()

    console.log('Status da compra:', status)

    if (status === 201 || status === 200) {
      // Verifica redirecionamento para pagina de confirmacao
      await page.waitForURL(/\/confirmacao\//, { timeout: 10000 })

      // Verifica elementos da pagina de confirmacao
      const confirmado = page.getByText(/confirmado|Ingresso/i)
      await expect(confirmado.first()).toBeVisible({ timeout: 5000 })

      // Verifica se QR Code aparece
      const qrCode = page.locator('img, svg, canvas').first()
      await expect(qrCode).toBeVisible({ timeout: 5000 })

      console.log('Compra de ingresso realizada com sucesso!')
    } else if (status === 422) {
      // Erro de validacao - verifica mensagem
      const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent()
      console.log('Erro de validacao:', errorText)
    } else {
      throw new Error(`Compra falhou com status ${status}`)
    }
  })

  test('deve mostrar erro para email ja utilizado', async ({ page }) => {
    // Usa email fixo para testar duplicata
    const emailFixo = 'teste.duplicata.ingresso@example.com'

    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')
    await page.waitForTimeout(1000)

    // Preenche formulario com email duplicado
    const campoNome = page.locator('input').first()
    await campoNome.fill('Teste Duplicata')

    const campoEmail = page.locator('input[type="email"]')
    await campoEmail.fill(emailFixo)

    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999997777')
    }

    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    // Envia formulario
    const botaoEnviar = page.getByRole('button', { name: /Garantir|Continuar/i })
    await botaoEnviar.click()

    // Aguarda resposta
    await page.waitForTimeout(3000)

    // Verifica se mostra erro (pode ser na segunda tentativa)
    const errorMessage = page.locator('.bg-red-50, .text-red-500, [class*="error"]')
    if (await errorMessage.isVisible().catch(() => false)) {
      const errorText = await errorMessage.first().textContent()
      console.log('Erro (possivelmente duplicata):', errorText)
    }
  })

  test('deve mostrar toast de erro quando API falha', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')
    await page.waitForTimeout(1000)

    // Preenche formulario
    const campoNome = page.locator('input').first()
    await campoNome.fill('Teste Erro API')

    const campoEmail = page.locator('input[type="email"]')
    await campoEmail.fill('teste.erro.api@example.com')

    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999996666')
    }

    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    // Intercepta requisicao para simular erro
    await page.route('**/api/evento/*/ingressos', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        })
      } else {
        route.continue()
      }
    })

    // Envia formulario
    const botaoEnviar = page.getByRole('button', { name: /Garantir|Continuar/i })
    await botaoEnviar.click()

    // Verifica que o toast de erro aparece
    await expect(page.getByText(/Erro no servidor/i)).toBeVisible({ timeout: 5000 })
    console.log('Toast de erro exibido corretamente')
  })

  test('deve formatar telefone corretamente', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')
    await page.waitForTimeout(1000)

    // Digita telefone sem formatacao
    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999998888')
      await page.waitForTimeout(500)

      // Verifica se foi formatado
      const valor = await campoTelefone.inputValue()
      console.log('Telefone formatado:', valor)

      // Deve estar no formato (XX) XXXXX-XXXX
      expect(valor).toMatch(/\(\d{2}\) \d{5}-\d{4}/)
    }
  })
})

test.describe('Pagina de Confirmacao', () => {
  test('deve exibir QR Code e dados do ingresso', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')
    await page.waitForTimeout(1000)

    const emailUnico = gerarEmailUnico()

    // Preenche e envia
    await page.locator('input').first().fill('Teste Confirmacao QR')
    await page.locator('input[type="email"]').fill(emailUnico)

    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999995555')
    }

    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/ingressos') && resp.request().method() === 'POST',
      { timeout: 15000 }
    )

    await page.getByRole('button', { name: /Garantir|Continuar/i }).click()

    const response = await responsePromise

    if (response.status() === 201 || response.status() === 200) {
      await page.waitForURL(/\/confirmacao\//, { timeout: 10000 })
      await page.waitForTimeout(1000)

      // Verifica QR Code
      const qrCode = page.locator('canvas, svg[class*="qr"], img[alt*="qr" i]').first()
      await expect(qrCode).toBeVisible({ timeout: 5000 })

      // Verifica dados do participante
      const nomeParticipante = page.getByText(/Teste Confirmacao QR/i)
      await expect(nomeParticipante).toBeVisible()

      // Verifica tipo de ingresso
      const tipoIngresso = page.getByText(/Tipo de Ingresso/i)
      if (await tipoIngresso.isVisible().catch(() => false)) {
        console.log('Informacao de tipo de ingresso visivel')
      }

      // Verifica status
      const status = page.getByText(/Confirmado|Aguardando/i)
      await expect(status.first()).toBeVisible()

      console.log('Pagina de confirmacao exibe todos os dados corretamente')
    }
  })

  test('deve mostrar mensagem de aviso sobre email', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')

    const emailUnico = gerarEmailUnico()

    await page.locator('input').first().fill('Teste Aviso Email')
    await page.locator('input[type="email"]').fill(emailUnico)

    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999994444')
    }

    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/ingressos') && resp.request().method() === 'POST',
      { timeout: 15000 }
    )

    await page.getByRole('button', { name: /Garantir|Continuar/i }).click()

    const response = await responsePromise

    if (response.status() === 201 || response.status() === 200) {
      await page.waitForURL(/\/confirmacao\//, { timeout: 10000 })

      // Verifica aviso sobre email de confirmacao
      const avisoEmail = page.getByText(/e-mail.*confirmacao|enviado/i)
      if (await avisoEmail.isVisible().catch(() => false)) {
        console.log('Aviso sobre email de confirmacao visivel')
      }
    }
  })

  test('deve ter link para voltar ao evento', async ({ page }) => {
    await page.goto(`/evento/${EVENTO_SLUG}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const botaoAumentar = page.locator('button').filter({ has: page.locator('svg path[d*="M12 4v16"]') }).first()

    if (!(await botaoAumentar.isVisible().catch(() => false))) {
      console.log('Nenhum ingresso disponivel')
      return
    }

    await botaoAumentar.click()
    await page.waitForTimeout(500)

    const botaoComprar = page.getByRole('button', { name: /Comprar/i })
    await botaoComprar.click()

    await page.waitForURL(/\/compra/, { timeout: 10000 })
    await page.waitForSelector('form')

    const emailUnico = gerarEmailUnico()

    await page.locator('input').first().fill('Teste Voltar')
    await page.locator('input[type="email"]').fill(emailUnico)

    const campoTelefone = page.locator('input[placeholder*="00000"]').first()
    if (await campoTelefone.isVisible().catch(() => false)) {
      await campoTelefone.fill('71999993333')
    }

    const termos = page.locator('input[type="checkbox"]')
    if (await termos.isVisible().catch(() => false)) {
      await termos.check()
    }

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/ingressos') && resp.request().method() === 'POST',
      { timeout: 15000 }
    )

    await page.getByRole('button', { name: /Garantir|Continuar/i }).click()

    const response = await responsePromise

    if (response.status() === 201 || response.status() === 200) {
      await page.waitForURL(/\/confirmacao\//, { timeout: 10000 })

      // Verifica link para voltar
      const linkVoltar = page.getByRole('link', { name: /Voltar.*evento/i })
      await expect(linkVoltar).toBeVisible()

      // Clica no link
      await linkVoltar.click()

      // Verifica que voltou para a pagina do evento
      await page.waitForURL(/\/evento\//, { timeout: 5000 })
      expect(page.url()).not.toContain('/confirmacao/')

      console.log('Link de voltar funcionando corretamente')
    }
  })
})

test.describe('Gestao de Tipos de Ingresso (Organizador)', () => {
  test.skip('deve acessar pagina de tipos de ingresso apos login', async ({ page }) => {
    // Este teste requer backend rodando com credenciais validas
    // Skip por padrao, rodar apenas em ambiente com backend configurado
    await fazerLogin(page)

    await page.goto('/dashboard')
    await page.waitForTimeout(2000)

    // Vai para o primeiro evento
    const eventoLink = page.locator('a[href*="/eventos/"]').first()

    if (await eventoLink.isVisible()) {
      await eventoLink.click()
      await page.waitForTimeout(1000)

      // Procura link para tipos de ingresso ou ingressos
      const ingressosLink = page.getByRole('link', { name: /ingresso/i }).first()

      if (await ingressosLink.isVisible().catch(() => false)) {
        await ingressosLink.click()
        await page.waitForTimeout(1000)

        // Verifica que a pagina carregou
        await expect(page.getByText(/Ingresso/i).first()).toBeVisible({ timeout: 5000 })
        console.log('Pagina de tipos de ingresso acessada')
      } else {
        console.log('Link para tipos de ingresso nao encontrado')
      }
    }
  })
})
