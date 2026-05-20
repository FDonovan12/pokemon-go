import { Routes } from '@angular/router';
import { DynamaxPage } from './pages/dynamax/dynamax.page';
import { EventComponent } from './pages/event/event.component';
import { HomeComponent } from './pages/home/home.component';
import { ListPokemonPages } from './pages/list-pokemon-pages/list-pokemon-pages';
import { ProbaPages } from './pages/proba/proba-pages';
import { PvpRankPages } from './pages/pvp-rank/pvp-rank';
import { InfographicPages } from './pages/ressources-pages/infographic/infographic-pages';
import { ShopPacksComponent } from './pages/ressources-pages/shop-packs/shop-packs-page';
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
        component: ListPokemonPages,
    },
    {
        path: 'dynamax',
        component: DynamaxPage,
    },
    {
        path: 'infographic',
        component: InfographicPages,
    },
    {
        path: 'shop-packs',
        component: ShopPacksComponent,
    },
    {
        path: 'pvp-rank',
        component: PvpRankPages,
    },
];
