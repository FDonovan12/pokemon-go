import { Routes } from '@angular/router';
import { DynamaxPage } from './pages/dynamax/dynamax.page';
import { EventComponent } from './pages/event/event.component';
import { HomeComponent } from './pages/home/home.component';
import { ListPokemonPages } from './pages/list-pokemon-page/list-pokemon-pages';
import { ShareListReceiveComponent } from './pages/list-pokemon-page/share-list-receive/share-list-receive.component';
import { ProbaPages } from './pages/proba/proba-pages';
import { PvpRankPages } from './pages/pvp-rank/pvp-rank';
import { InfographicPages } from './pages/ressources-page/infographic/infographic-pages';
import { ShopPacksComponent } from './pages/ressources-page/shop-packs/shop-packs-page';
import { TypesPages } from './pages/types-page/types-pages';

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
        children: [
            { path: '', component: ListPokemonPages },
            { path: 'share/:data', component: ShareListReceiveComponent },
        ],
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
