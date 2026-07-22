import { Routes } from '@angular/router';
import { filterResolver, folderResolver } from '@shared/resolver/filter';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
        children: [
            {
                path: 'filters/add',
                loadComponent: () => import('./pages/home/add-filter/add-filter.page').then((m) => m.AddFilterPage),
            },
            {
                path: 'filters/edit/:id',
                loadComponent: () => import('./pages/home/add-filter/add-filter.page').then((m) => m.AddFilterPage),
                resolve: { filter: filterResolver },
            },
            {
                path: 'filters/folder/add',
                loadComponent: () => import('./pages/home/add-folder/add-folder.page').then((m) => m.AddFolderPage),
            },
            {
                path: 'filters/folder/edit/:id',
                loadComponent: () => import('./pages/home/add-folder/add-folder.page').then((m) => m.AddFolderPage),
                resolve: { folder: folderResolver },
            },
        ],
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
        children: [
            {
                path: 'detail/:slug',
                loadComponent: () =>
                    import('./pages/pvp-rank-detail-page/pvp-rank-detail-page').then((m) => m.PvpRankDetailPage),
            },
        ],
    },
];
