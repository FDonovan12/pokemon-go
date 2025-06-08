import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { Logger } from '@services/logger/logger';
import { LoggerDev } from '@services/logger/logger.dev';
import { LoggerProd } from '@services/logger/logger.prod';
import { environment } from 'environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: Logger, useClass: environment.production ? LoggerProd : LoggerDev },
    ],
};
