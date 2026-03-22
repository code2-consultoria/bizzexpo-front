import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Landing Page
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true },
    },
    // Evento Publico
    {
      path: '/evento/:slug',
      name: 'evento-publico',
      component: () => import('@/views/evento/EventoPublicoView.vue'),
      meta: { public: true },
    },
    {
      path: '/evento/:slug/inscricao',
      name: 'evento-inscricao',
      component: () => import('@/views/evento/InscricaoView.vue'),
      meta: { public: true },
    },
    {
      path: '/evento/:slug/confirmacao/:qrcode',
      name: 'evento-confirmacao',
      component: () => import('@/views/evento/ConfirmacaoView.vue'),
      meta: { public: true },
    },
    // Rotas de autenticacao (visitantes)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { guest: true },
    },
    // Rotas protegidas
    {
      path: '/organizador/cadastro',
      name: 'organizador-cadastro',
      component: () => import('@/views/organizador/CadastroView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    // Eventos
    {
      path: '/eventos',
      name: 'eventos',
      component: () => import('@/views/eventos/EventosListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/criar',
      name: 'evento-criar',
      component: () => import('@/views/eventos/EventoCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id',
      name: 'evento-detalhes',
      component: () => import('@/views/eventos/EventoDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id/editar',
      name: 'evento-editar',
      component: () => import('@/views/eventos/EventoEditView.vue'),
      meta: { requiresAuth: true },
    },
    // Expositores
    {
      path: '/eventos/:eventoId/expositores',
      name: 'expositores',
      component: () => import('@/views/expositores/ExpositoresListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/expositores/criar',
      name: 'expositor-criar',
      component: () => import('@/views/expositores/ExpositorCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/expositores/:id/editar',
      name: 'expositor-editar',
      component: () => import('@/views/expositores/ExpositorEditView.vue'),
      meta: { requiresAuth: true },
    },
    // Categorias
    {
      path: '/eventos/:eventoId/categorias',
      name: 'categorias',
      component: () => import('@/views/categorias/CategoriasListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/categorias/criar',
      name: 'categoria-criar',
      component: () => import('@/views/categorias/CategoriaCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/categorias/:id/editar',
      name: 'categoria-editar',
      component: () => import('@/views/categorias/CategoriaEditView.vue'),
      meta: { requiresAuth: true },
    },
    // Estandes
    {
      path: '/eventos/:eventoId/expositores/:expositorId/estandes',
      name: 'estandes',
      component: () => import('@/views/estandes/EstandesListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/expositores/:expositorId/estandes/criar',
      name: 'estande-criar',
      component: () => import('@/views/estandes/EstandeCreateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/expositores/:expositorId/estandes/:id/editar',
      name: 'estande-editar',
      component: () => import('@/views/estandes/EstandeEditView.vue'),
      meta: { requiresAuth: true },
    },
    // Inscricoes
    {
      path: '/eventos/:eventoId/inscricoes',
      name: 'inscricoes',
      component: () => import('@/views/inscricoes/InscricoesListView.vue'),
      meta: { requiresAuth: true },
    },
    // Staff
    {
      path: '/eventos/:eventoId/staff',
      name: 'staff',
      component: () => import('@/views/staff/StaffListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/staff/adicionar',
      name: 'staff-adicionar',
      component: () => import('@/views/staff/StaffAddView.vue'),
      meta: { requiresAuth: true },
    },
    // Check-in
    {
      path: '/evento/:slug/totem',
      name: 'checkin-totem',
      component: () => import('@/views/checkin/TotemView.vue'),
      meta: { public: true, fullscreen: true },
    },
    {
      path: '/eventos/:eventoId/checkin',
      name: 'checkin-staff',
      component: () => import('@/views/checkin/StaffCheckinView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:eventoId/checkin/walkin',
      name: 'checkin-walkin',
      component: () => import('@/views/checkin/WalkinView.vue'),
      meta: { requiresAuth: true },
    },
    // Expositor Dashboard
    {
      path: '/expositor/dashboard',
      name: 'expositor-dashboard',
      component: () => import('@/views/expositor/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/expositor/leads',
      name: 'expositor-leads',
      component: () => import('@/views/expositor/LeadsListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/expositor/carrinho',
      name: 'expositor-carrinho',
      component: () => import('@/views/expositor/CarrinhoView.vue'),
      meta: { requiresAuth: true },
    },
    // Faturas
    {
      path: '/minhas-faturas',
      name: 'minhas-faturas',
      component: () => import('@/views/faturas/FaturasListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/faturas/:id',
      name: 'fatura-detalhes',
      component: () => import('@/views/faturas/FaturaDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/faturas/:id/pagar',
      name: 'fatura-pagar',
      component: () => import('@/views/faturas/FaturaPagarView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pagamento/:id/confirmado',
      name: 'pagamento-confirmado',
      component: () => import('@/views/faturas/PagamentoConfirmadoView.vue'),
      meta: { requiresAuth: true },
    },
    // Admin
    {
      path: '/admin/financeiro',
      name: 'admin-financeiro',
      component: () => import('@/views/admin/FinanceiroView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/catalogo',
      name: 'admin-catalogo',
      component: () => import('@/views/admin/catalogo/CatalogoView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/faturas',
      name: 'admin-faturas',
      component: () => import('@/views/admin/faturas/FaturasAdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/faturas/:id',
      name: 'admin-fatura-detalhes',
      component: () => import('@/views/admin/faturas/FaturaAdminDetailView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(authGuard)

export default router
