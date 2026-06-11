import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IMAGES } from '@shared/assets/images.generated';

@Component({
    selector: 'app-infographic-pages',
    imports: [],
    templateUrl: './infographic-pages.html',
    styleUrl: './infographic-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfographicPages {
    ressourcesKeys = Object.keys(IMAGES.ressources.infographie) as Array<keyof typeof IMAGES.ressources.infographie>;

    images = this.ressourcesKeys.map((key) => IMAGES.ressources.infographie[key]);
}
