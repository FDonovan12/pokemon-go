import { ApplicationConfig, LOCALE_ID, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Logger } from '@services/logger/logger';
import { LoggerDev } from '@services/logger/logger.dev';
import { LoggerProd } from '@services/logger/logger.prod';
import { environment } from 'environments/environment';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(
            routes,
            withComponentInputBinding(),
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
            }),
        ),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: Logger, useClass: environment.production ? LoggerProd : LoggerDev },
        { provide: LocationStrategy, useClass: HashLocationStrategy }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    ],
};
