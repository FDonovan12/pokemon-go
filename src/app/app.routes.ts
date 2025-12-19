import { Routes } from '@angular/router';
import { DynamaxPage } from './pages/dynamax/dynamax.page';
import { EventComponent } from './pages/event/event.component';
import { HomeComponent } from './pages/home/home.component';
import { KeepPokemonPages } from './pages/keep-pokemon-pages/keep-pokemon-pages';
import { ProbaPages } from './pages/proba/proba-pages';
import { RessourcesPages } from './pages/ressources-pages/ressources-pages';
import { TypesPages } from './pages/types-pages/types-pages';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'event',
        children: [{ path: ':slug', component: EventComponent }],
    },
    {
        path: 'proba',
        component: ProbaPages,
    },
    {
        path: 'types',
        component: TypesPages,
    },
    {
        path: 'keep',
        component: KeepPokemonPages,
    },
    {
        path: 'dynamax',
        component: DynamaxPage,
    },
    {
        path: 'ressources',
        component: RessourcesPages,
    },
];
