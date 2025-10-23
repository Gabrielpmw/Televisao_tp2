import { Routes } from '@angular/router';
//import {FabricanteListComponent } from './components/fabricante-list/fabricante-list';
//import { FabricanteForm } from './components/fabricante-form/fabricante-form';
import {FabricanteListComponent } from './components/fabricante-list/fabricante-list';
import { FabricanteForm } from './components/fabricante-form/fabricante-form';

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
    }
];
