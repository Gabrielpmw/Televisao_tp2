import { Routes } from '@angular/router';

// --- IMPORTAÇÕES DE COMPONENTES ---

// 1. LOGIN
import { LoginComponent } from './components/login/login';

// 2. CADASTRO
import { CadastroUsuario } from './components/cadastro-usuario/cadastro-usuario';

// 3. RECUPERAR SENHA
import { RecuperarSenhaComponent } from './components/recuperar-senha/recuperar-senha';

// 4. PERFIL (cliente)
import { PerfilTemplate } from './components/perfil-template/perfil-template';
import { DadosPessoaisComponent } from './components/dados-pessoais/dados-pessoais';
import { EnderecoPessoal } from './components/endereco-pessoal/endereco-pessoal';

// 5. ROTAS DE CRUD EXISENTES (adm)
import { FabricanteListComponent } from './components/fabricante-list/fabricante-list';
import { FabricanteForm } from './components/fabricante-form/fabricante-form';
import { TelevisaoListComponent } from './components/televisao-list-component/televisao-list-component';
import { TelevisaoFormComponent } from './components/televisao-form-component/televisao-form-component';
import { FornecedorListComponent } from './components/fornecedor-list/fornecedor-list';
import { FornecedorFormComponent } from './components/fornecedor-form/fornecedor-form';
import { MarcaListComponent } from './components/marca-list/marca-list';
import { MarcaFormComponent } from './components/marca-form/marca-form';
import { ModeloListComponent } from './components/modelo-list/modelo-list';
import { ModeloFormComponent } from './components/modelo-form/modelo-form';
import { Home } from './components/home/home';

// --- IMPORTAÇÕES DE GUARDS ---
import { authGuard } from './guard/auth.guard';
// Assumindo que você criou este arquivo
import { roleGuard } from './guard/role.guard'; 

export const routes: Routes = [

    // =========================================================================
    // 1. ROTAS PÚBLICAS NO NÍVEL RAIZ (ACESSÍVEIS A TODOS)
    // =========================================================================
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
        data: { public: true } 
    },
    {
        path: 'cadastro',
        component: CadastroUsuario, 
        title: 'Cadastro de Usuário',
        data: { public: true }
    },
    {
        path: 'recuperar-senha',
        component: RecuperarSenhaComponent,
        title: 'Recuperar Senha',
        data: { public: true }
    },
    // Rota Home: Acesso Geral (Não requer login, mas é útil permitir se estiver logado)
    { 
        path: '', 
        component: Home,
        title: 'Início',
        data: { public: true } // Acesso público para a home
    },
    { 
        path: 'televisoes', 
        component: TelevisaoListComponent,
        title: 'Lista de Televisões',
        // Permite cliente ou adm, mas exige que esteja logado
        data: { public: true }
    },


    // =========================================================================
    // 2. ROTAS EXCLUSIVAS DO USUÁRIO cliente (REQUER AUTH + ROLE: cliente)
    // =========================================================================
    {
        path: 'perfil',
        component: PerfilTemplate, 
        title: 'Meu Perfil',
        // RESTRITO: Exige Login (authGuard) E deve ter o Role cliente.
        canActivate: [authGuard, roleGuard(['cliente'])], 
        children: [
            { path: '', redirectTo: 'dados-pessoais', pathMatch: 'full' },
            { 
                path: 'dados-pessoais', 
                component: DadosPessoaisComponent, 
                title: 'Dados Pessoais' 
            },
            { 
                path: 'enderecos', 
                component: EnderecoPessoal,
                title: 'Meus Endereços'
            },
            // { path: 'pedidos', component: PedidosListComponent }, // FUTURO
            // { path: 'cancelamentos', component: CancelamentosComponent } // FUTURO
        ]
    },


    // =========================================================================
    // 3. ROTAS EXCLUSIVAS DO ADMINISTRADOR (REQUER AUTH + ROLE: adm)
    // =========================================================================

    // Agrupamento para Fabricante (ADM)
    {
        path: 'fabricantes',
        component: FabricanteListComponent,
        title: 'Lista de Fabricantes',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'fabricantes/new',
        component: FabricanteForm,
        title: 'Novo Fabricante',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'fabricantes/edit/:id',
        component: FabricanteForm,
        title: 'Editar Fabricante',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    
    // Agrupamento para Fornecedor (ADM)
    {
        path: 'fornecedores',
        component: FornecedorListComponent,
        title: 'Lista de Fornecedores',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'fornecedores/new',
        component: FornecedorFormComponent,
        title: 'Novo Fornecedor',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'fornecedores/edit/:id',
        component: FornecedorFormComponent,
        title: 'Editar Fornecedor',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    
    // Agrupamento para Marca (ADM)
    {
        path: 'marcas',
        component: MarcaListComponent,
        title: 'Lista de Marcas',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'marcas/new',
        component: MarcaFormComponent,
        title: 'Nova Marca',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'marcas/edit/:id',
        component: MarcaFormComponent,
        title: 'Editar Marca',
        canActivate: [authGuard, roleGuard(['adm'])]
    },

    // Agrupamento para Modelo (ADM)
    {
        path: 'modelos',
        component: ModeloListComponent,
        title: 'Lista de Modelos',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'modelos/new',
        component: ModeloFormComponent,
        title: 'Novo Modelo',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    {
        path: 'modelos/edit/:id',
        component: ModeloFormComponent,
        title: 'Editar Modelo',
        canActivate: [authGuard, roleGuard(['adm'])]
    },


    // =========================================================================
    // 4. ROTAS DE ACESSO MISTO (REQUER AUTH + ROLE: cliente OU adm)
    // =========================================================================
    
    // Cadastro/Edição de Televisões (Acesso APENAS para adm)
    {
        path: 'televisoes/new',
        component: TelevisaoFormComponent,
        title: 'Nova Televisão',
        canActivate: [authGuard, roleGuard(['adm'])] 
    },
    {
        path: 'televisoes/edit/:id',
        component: TelevisaoFormComponent,
        title: 'Editar Televisão',
        canActivate: [authGuard, roleGuard(['adm'])]
    },
    
    // Catch-all para rotas não encontradas (Opcional)
    // { path: '**', redirectTo: '' }
];