import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { TypeComponent } from 'app/shared/components/type/type.component';
import { PercentColor } from '../../shared/components/percent-color/percent-color';
import { RelationTypeComponent } from './components/relation-type-component/relation-type-component';
import { TypesStore } from './types-store/types-store';

@Component({
    selector: 'app-types-pages',
    imports: [PercentColor, TypeComponent, RelationTypeComponent],
    templateUrl: './types-pages.html',
    styleUrl: './types-pages.css',
    providers: [TypesStore],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesPages {
    protected readonly store = inject(TypesStore);

    typesList = allTypes;

    toggleTeam(type: TypePokemon) {
        this.store.toggleTeam(type);
    }

    toggleTeamAll() {
        this.store.toggleTeamAll();
    }
}
