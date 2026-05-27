import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagePokemon } from 'app/shared/components/image-pokemon/image-pokemon';
import { PercentColor } from 'app/shared/components/percent-color/percent-color';
import { TypeComponent } from 'app/shared/components/type/type.component';
import { MeasurePerf } from 'app/shared/decorator/measure-perf';
import { allTypes } from './../../entities/pokemon';
import { DynamaxStore } from './dynamax-store/dynamax-store';

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

    // constructor() {
    //     effect(() => {
    //         this.dynamaxStore.setSearch(this.search() ?? '');
    //     });
    // }
}
