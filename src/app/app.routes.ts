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

// 5. COMPONENTE DE SEGURANÇA
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
import { Carrinho } from './components/carrinho/carrinho';

// --- NOVO COMPONENTE (Importado aqui) ---
import { UsuarioList } from './components/usuarios-list/usuarios-list';
import { UsuarioForm } from './components/usuarios-form/usuarios-form';
// --- IMPORTAÇÕES DE GUARDS ---
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard';
import { PedidoList } from './components/pedido-list/pedido-list';


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
            { path: 'dados-pessoais', component: DadosPessoaisComponent, title: 'Dados Pessoais' },
            { path: 'enderecos', component: EnderecoPessoal, title: 'Meus Endereços' },
            
            // ✅ Nova rota adicionada aqui:
            { path: 'pedidos', component: PedidoList, title: 'Meus Pedidos' },

            { path: 'gerenciar-credenciais', component: GerenciarCredenciaisComponent, title: 'Segurança' }
        ]
    },

    {
        path: 'carrinho',
        component: Carrinho,
        title: 'Meu Carrinho de Compras',
        canActivate: [authGuard, roleGuard(['cliente'])]
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

            // Segurança do Admin
            {
                path: 'gerenciar-credenciais',
                component: GerenciarCredenciaisComponent,
                title: 'Segurança - Credenciais'
            },

            // --- GESTÃO DE USUÁRIOS (CLIENTES) ---
            { 
                path: 'usuarios', 
                component: UsuarioList, 
                title: 'Gerenciar Clientes' 
            },
            { 
                path: 'usuarios/new', 
                component: UsuarioForm, 
                title: 'Novo Cliente' 
            },
            { 
                path: 'usuarios/editar/:id', 
                component: UsuarioForm, 
                title: 'Editar Cliente' 
            },

            // --- OUTROS CRUDS ---
            
            // Fabricantes
            { path: 'fabricantes', component: FabricanteListComponent, title: 'Lista de Fabricantes' },
            { path: 'fabricantes/new', component: FabricanteForm, title: 'Novo Fabricante' },
            { path: 'fabricantes/edit/:id', component: FabricanteForm, title: 'Editar Fabricante' },

            // Fornecedores
            { path: 'fornecedores', component: FornecedorListComponent, title: 'Lista de Fornecedores' },
            { path: 'fornecedores/new', component: FornecedorFormComponent, title: 'Novo Fornecedor' },
            { path: 'fornecedores/edit/:id', component: FornecedorFormComponent, title: 'Editar Fornecedor' },

            // Marcas
            { path: 'marcas', component: MarcaListComponent, title: 'Lista de Marcas' },
            { path: 'marcas/new', component: MarcaFormComponent, title: 'Nova Marca' },
            { path: 'marcas/edit/:id', component: MarcaFormComponent, title: 'Editar Marca' },

            // Modelos
            { path: 'modelos', component: ModeloListComponent, title: 'Lista de Modelos' },
            { path: 'modelos/new', component: ModeloFormComponent, title: 'Novo Modelo' },
            { path: 'modelos/edit/:id', component: ModeloFormComponent, title: 'Editar Modelo' },

            // Televisões
            { path: 'televisoes-lista', component: TelevisaoAdminList, title: 'Gerenciar Televisões' },
            { path: 'televisoes/new', component: TelevisaoFormComponent, title: 'Nova Televisão' },
            { path: 'televisoes/edit/:id', component: TelevisaoFormComponent, title: 'Editar Televisão' },

            // Funcionários (Admins)
            { path: 'funcionarios', component: FuncionarioList, title: 'Gerenciar Funcionários' },
            { path: 'funcionarios/new', component: FuncionarioForm, title: 'Novo Funcionário' },
            { path: 'funcionarios/edit/:id', component: FuncionarioForm, title: 'Editar Funcionário' },
        ]
    },
];