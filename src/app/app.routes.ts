import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './app.component copy';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'event',
        children: [
            {
                path: ':slug',
                loadComponent: () => import('./pages/event/event.component').then((m) => m.EventComponent),
            },
        ],
    },
    {
        path: 'proba',
        loadComponent: () => import('./pages/proba/proba-pages').then((m) => m.ProbaPages),
    },
    {
        path: 'types',
        loadComponent: () => import('./pages/types-page/types-pages').then((m) => m.TypesPages),
    },
    {
        path: 'keep',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./pages/list-pokemon-page/list-pokemon-pages').then((m) => m.ListPokemonPages),
            },
            {
                path: 'share/:data',
                loadComponent: () =>
                    import('./pages/list-pokemon-page/share-list-receive/share-list-receive.component').then(
                        (m) => m.ShareListReceiveComponent,
                    ),
            },
        ],
    },
    { path: 'auth/callback', component: AuthCallbackComponent },
    {
        path: 'dynamax',
        loadComponent: () => import('./pages/dynamax/dynamax.page').then((m) => m.DynamaxPage),
    },
    {
        path: 'infographic',
        loadComponent: () =>
            import('./pages/ressources-page/infographic/infographic-pages').then((m) => m.InfographicPages),
    },
    {
        path: 'shop-packs',
        loadComponent: () =>
            import('./pages/ressources-page/shop-packs/shop-packs-page').then((m) => m.ShopPacksComponent),
    },
    {
        path: 'pvp-rank',
        loadComponent: () => import('./pages/pvp-rank/pvp-rank').then((m) => m.PvpRankPages),
    },
];
