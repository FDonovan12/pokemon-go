import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { allTypes } from './../../entities/pokemon';
import { DynamaxStore } from './dynamax-store/dynamax-store';
import { ImagePokemon } from '../../shared/components/image-pokemon/image-pokemon';
import { PercentColor } from '../../shared/components/percent-color/percent-color';
import { TypeComponent } from '../../shared/components/type/type.component';
import { MeasurePerf } from '../../shared/decorator/measure-perf';

@MeasurePerf()
@Component({
    selector: 'app-dynamax.page',
    imports: [TypeComponent, ImagePokemon, PercentColor, FormsModule, ReactiveFormsModule],
    templateUrl: './dynamax.page.html',
    styleUrl: './dynamax.page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamaxPage {
    protected readonly dynamaxStore = inject(DynamaxStore);

    typesList = allTypes;

    test = this.dynamaxStore.finalAllDynamaxPokemonResultDamageBase();

    maxDamage = this.dynamaxStore.maxDamageFind();

    search = this.dynamaxStore.search;
}
