import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
    ],
};
