import { Routes } from '@angular/router';

// 1. IMPORTAÇÃO DO NOVO COMPONENTE
import { LoginComponent } from './components/login/login';
// (Confirme se este caminho está correto)

// Seus componentes existentes
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

export const routes: Routes = [

    // 2. ROTA DE LOGIN ADICIONADA PARA TESTE
    {
        path: 'login',
        component: LoginComponent
    },

    // --- SUAS ROTAS EXISTENTES (INTOCADAS) ---
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
        // Sua rota principal continua a mesma, como pedido.
        path: '', 
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
    }
];