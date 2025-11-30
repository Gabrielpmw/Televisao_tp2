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

// 5. COMPONENTE DE SEGURANÇA (Novo)
// Ajuste o caminho conforme a pasta real onde você criou o componente
import { GerenciarCredenciaisComponent } from './components/gerenciar-credenciais/gerenciar-credenciais';

// 6. ROTAS DE CRUD EXISENTES (adm)
import { FabricanteListComponent } from './components/fabricante-list/fabricante-list';
import { FabricanteForm } from './components/fabricante-form/fabricante-form';
import { TelevisaoListComponent } from './components/televisao-list-component/televisao-list-component';
import { TelevisaoFormComponent } from './components/televisao-form-component/televisao-form-component';
import { TelevisaoAdminList } from './components/televisao-admin-list/televisao-admin-list';
import { FornecedorListComponent } from './components/fornecedor-list/fornecedor-list';
import { FornecedorFormComponent } from './components/fornecedor-form/fornecedor-form';
import { MarcaListComponent } from './components/marca-list/marca-list';
import { MarcaFormComponent } from './components/marca-form/marca-form';
import { ModeloListComponent } from './components/modelo-list/modelo-list';
import { ModeloFormComponent } from './components/modelo-form/modelo-form';
import { Home } from './components/home/home';
import { AdminTemplate } from './components/admin-template/admin-template';
import { FuncionarioList } from './components/funcionar-list/funcionario-list';
import { FuncionarioForm } from './components/funcionario-form/funcionario-form';

// --- IMPORTAÇÕES DE GUARDS ---
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard';


export const routes: Routes = [

    // =========================================================================
    // 1. ROTAS PÚBLICAS NO NÍVEL RAIZ
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
    {
        path: '',
        component: Home,
        title: 'Início',
        data: { public: true }
    },
    {
        path: 'televisoes',
        component: TelevisaoListComponent,
        title: 'Lista de Televisões',
        data: { public: true }
    },


    // =========================================================================
    // 2. ROTAS EXCLUSIVAS DO USUÁRIO CLIENTE
    // =========================================================================
    {
        path: 'perfil',
        component: PerfilTemplate,
        title: 'Meu Perfil',
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
            // ADICIONADO: Rota de Segurança para Cliente
            {
                path: 'gerenciar-credenciais',
                component: GerenciarCredenciaisComponent,
                title: 'Segurança - Credenciais'
            }
        ]
    },


    // =========================================================================
    // 3. ROTAS EXCLUSIVAS DO ADMINISTRADOR
    // =========================================================================
    {
        path: 'perfil-admin',
        component: AdminTemplate,
        title: 'Painel Administrativo',
        canActivate: [authGuard, roleGuard(['adm'])],
        children: [
            // Ponto de entrada
            { path: '', pathMatch: 'full', redirectTo: 'televisoes-lista' },

            // ADICIONADO: Rota de Segurança para Admin
            {
                path: 'gerenciar-credenciais',
                component: GerenciarCredenciaisComponent,
                title: 'Segurança - Credenciais'
            },

            // --- CRUDS ---
            // Fabricante
            { path: 'fabricantes', component: FabricanteListComponent, title: 'Lista de Fabricantes' },
            { path: 'fabricantes/new', component: FabricanteForm, title: 'Novo Fabricante' },
            { path: 'fabricantes/edit/:id', component: FabricanteForm, title: 'Editar Fabricante' },

            // Fornecedor
            { path: 'fornecedores', component: FornecedorListComponent, title: 'Lista de Fornecedores' },
            { path: 'fornecedores/new', component: FornecedorFormComponent, title: 'Novo Fornecedor' },
            { path: 'fornecedores/edit/:id', component: FornecedorFormComponent, title: 'Editar Fornecedor' },

            // Marca
            { path: 'marcas', component: MarcaListComponent, title: 'Lista de Marcas' },
            { path: 'marcas/new', component: MarcaFormComponent, title: 'Nova Marca' },
            { path: 'marcas/edit/:id', component: MarcaFormComponent, title: 'Editar Marca' },

            // Modelo
            { path: 'modelos', component: ModeloListComponent, title: 'Lista de Modelos' },
            { path: 'modelos/new', component: ModeloFormComponent, title: 'Novo Modelo' },
            { path: 'modelos/edit/:id', component: ModeloFormComponent, title: 'Editar Modelo' },

            // Televisões
            {
                path: 'televisoes-lista',
                component: TelevisaoAdminList,
                title: 'Gerenciar Televisões'
            },
            { path: 'televisoes/new', component: TelevisaoFormComponent, title: 'Nova Televisão' },
            { path: 'televisoes/edit/:id', component: TelevisaoFormComponent, title: 'Editar Televisão' },

            // Funcionários
            { path: 'funcionarios', component: FuncionarioList, title: 'Gerenciar Funcionários' },
            { path: 'funcionarios/new', component: FuncionarioForm, title: 'Novo Funcionário' },
            { path: 'funcionarios/edit/:id', component: FuncionarioForm, title: 'Editar Funcionário' },
        ]
    },
];