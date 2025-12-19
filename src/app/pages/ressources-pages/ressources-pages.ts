import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IMAGES } from 'app/shared/assets/images.generated';

@Component({
    selector: 'app-ressources-pages',
    imports: [],
    templateUrl: './ressources-pages.html',
    styleUrl: './ressources-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RessourcesPages {
    ressourcesKeys = Object.keys(IMAGES.ressources) as Array<keyof typeof IMAGES.ressources>;

    images = this.ressourcesKeys.map((key) => IMAGES.ressources[key]);
}
