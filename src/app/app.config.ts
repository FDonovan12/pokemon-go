import { ApplicationConfig, LOCALE_ID, isDevMode, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { Logger } from '@services/logger/logger';
import { LoggerDev } from '@services/logger/logger.dev';
import { LoggerProd } from '@services/logger/logger.prod';
import { environment } from 'environments/environment';
import { routes } from './app.routes';
import { runMigrations } from '@services/migration-service/migration-service';

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
        provideAppInitializer(() => runMigrations()),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: Logger, useClass: environment.production ? LoggerProd : LoggerDev },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
};
