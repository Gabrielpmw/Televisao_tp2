import { Routes } from '@angular/router';

// 1. LOGIN
import { LoginComponent } from './components/login/login';

// 2. CADASTRO
import { CadastroUsuario } from './components/cadastro-usuario/cadastro-usuario';
// Nota: Se você usou "CadastroUsuario" no seu projeto, mantenha o nome que está lá.
// No exemplo abaixo estou usando o nome padrão do componente gerado.

// 3. RECUPERAR SENHA
import { RecuperarSenhaComponent } from './components/recuperar-senha/recuperar-senha';
// 4. PERFIL (TEMPLATE E DADOS PESSOAIS)
// Importe o Componente Pai (Barra Lateral)
import { PerfilTemplate } from './components/perfil-template/perfil-template';
// Importe o Componente Filho (Formulário)
import { DadosPessoaisComponent } from './components/dados-pessoais/dados-pessoais';
// --- Seus componentes existentes (MANTIVE IGUAL) ---
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
import { EnderecoPessoal } from './components/endereco-pessoal/endereco-pessoal';
import { Home } from './components/home/home';

export const routes: Routes = [

    // --- ROTAS PÚBLICAS ---
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'cadastro',
        component: CadastroUsuario
    },
    {
        path: 'recuperar-senha',
        component: RecuperarSenhaComponent
    },

    // --- ROTA DO PERFIL (COM BARRA LATERAL) ---
    {
        path: 'perfil',
        component: PerfilTemplate, // 1. Carrega a moldura (Sidebar)
        children: [
            // 2. Redireciona /perfil para /perfil/dados-pessoais automaticamente
            { path: '', redirectTo: 'dados-pessoais', pathMatch: 'full' },
            
            // 3. Renderiza o formulário DENTRO da moldura
            { path: 'dados-pessoais', component: DadosPessoaisComponent },
            
            // --- Futuros Componentes (Descomente quando criar os arquivos) ---
             { path: 'enderecos', component: EnderecoPessoal },
            // { path: 'pedidos', component: PedidosListComponent },
            // { path: 'cancelamentos', component: CancelamentosComponent }
        ]
    },

    // --- SUAS ROTAS EXISTENTES ---
    {
        path: 'fabricantes',
        component: FabricanteListComponent
    },
    {
        path: 'fabricantes/new',
        component: FabricanteForm
    },
    {
        path: 'fabricantes/edit/:id',
        component: FabricanteForm
    },
    {
        path: 'fornecedores',
        component: FornecedorListComponent
    },
    {
        path: 'fornecedores/new',
        component: FornecedorFormComponent 
    },
    {
        path: 'fornecedores/edit/:id',
        component: FornecedorFormComponent 
    },
    {
        path: 'televisoes', 
        component: TelevisaoListComponent
    },
    {
        path: 'televisoes/new',
        component: TelevisaoFormComponent
    },
    {
        path: 'televisoes/edit/:id',
        component: TelevisaoFormComponent
    },
    {
        path: 'marcas',
        component: MarcaListComponent
    },
    {
        path: 'marcas/new',
        component: MarcaFormComponent
    },
    {
        path: 'marcas/edit/:id',
        component: MarcaFormComponent
    },
    {
        path: 'modelos',
        component: ModeloListComponent
    },
    {
        path: 'modelos/new',
        component: ModeloFormComponent
    },
    {
        path: 'modelos/edit/:id',
        component: ModeloFormComponent
    },
    {
        path: '', 
        component: Home
    },
];