import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { PercentColor } from '@components/percent-color/percent-color';
import { TypeComponent } from '@components/type/type.component';
import { allTypes } from './../../entities/pokemon';
import { DynamaxStore } from './dynamax-store/dynamax-store';

@Component({
    selector: 'app-dynamax.page',
    imports: [TypeComponent, ImagePokemon, PercentColor],
    templateUrl: './dynamax.page.html',
    styleUrl: './dynamax.page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamaxPage {
    dynamaxStore = inject(DynamaxStore);

    typesList = allTypes;

    test = this.dynamaxStore.allDynamaxPokemonResultDamageBase();

    maxDamage = this.dynamaxStore.maxDamageFind();
}
