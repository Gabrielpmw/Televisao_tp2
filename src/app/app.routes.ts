import { Routes } from '@angular/router';
//import {FabricanteListComponent } from './components/fabricante-list/fabricante-list';
//import { FabricanteForm } from './components/fabricante-form/fabricante-form';
import {FabricanteListComponent } from './components/fabricante-list/fabricante-list';
import { FabricanteForm } from './components/fabricante-form/fabricante-form';
import { TelevisaoListComponent } from './components/televisao-list-component/televisao-list-component';
import { TelevisaoFormComponent } from './components/televisao-form-component/televisao-form-component';
import { FornecedorListComponent } from './components/fornecedor-list/fornecedor-list';
import { FornecedorFormComponent } from './components/fornecedor-form/fornecedor-form';
import { MarcaListComponent } from './components/marca-list/marca-list';
import { MarcaFormComponent } from './components/marca-form/marca-form';

export const routes: Routes = [
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
      component: FornecedorFormComponent // Rota para o formulário de criação
    },
    {
      path: 'fornecedores/edit/:id',
      component: FornecedorFormComponent // Rota para o formulário de edição
    },
    // Rotas de Televisão
    {
        // Esta é a rota que você pediu:
        // Mostra seu TelevisaoListComponent quando a URL for /televisoes
        path: 'televisoes', 
        component: TelevisaoListComponent
    },
    {
        // Rota para criar uma nova televisão
        path: 'televisoes/new',
        component: TelevisaoFormComponent 
    },
    {
        // Rota para editar uma televisão existente (passando o ID)
        path: 'televisoes/edit/:id',
        component: TelevisaoFormComponent
    },
    { 
        path: 'marcas', 
        component: MarcaListComponent 
    },

    // 2. CORRIJA ESTA ROTA
    { 
        path: 'marcas/new', 
        component: MarcaFormComponent
    },

    // 3. CORRIJA ESTA ROTA
    { 
        path: 'marcas/edit/:id', 
        component: MarcaFormComponent 
    },
];
