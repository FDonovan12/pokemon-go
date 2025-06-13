import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { PercentColor } from '../../components/percent-color/percent-color';
import { TypesStore } from './types-store/types-store';

@Component({
    selector: 'app-types-pages',
    imports: [PercentColor],
    templateUrl: './types-pages.html',
    styleUrl: './types-pages.css',
    providers: [TypesStore],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesPages {
    readonly store = inject(TypesStore);

    typesList = allTypes;

    toggleTeam(type: TypePokemon) {
        this.store.toggleTeam(type);
    }
}
