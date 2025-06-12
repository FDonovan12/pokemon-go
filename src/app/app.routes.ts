import { Routes } from '@angular/router';
import { EventComponent } from './pages/event/event.component';
import { HomeComponent } from './pages/home/home.component';
import { ProbaPages } from './pages/proba/proba-pages';
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
];
