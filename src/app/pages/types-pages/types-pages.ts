import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { PercentColor } from '../../components/percent-color/percent-color';
import { RelationTypeComponent } from './components/relation-type-component/relation-type-component';
import { TypesStore } from './types-store/types-store';
import { TypeComponent } from '@components/type/type.component';

@Component({
    selector: 'app-types-pages',
    imports: [PercentColor, TypeComponent, RelationTypeComponent],
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

    toggleTeamAll() {
        this.store.toggleTeamAll();
    }
}
