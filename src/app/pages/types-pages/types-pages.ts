import { Component, inject } from '@angular/core';
import { allTypes, TypePokemon } from '@entities/pokemon';
import { TypesStore } from './types-store/types-store';

@Component({
    selector: 'app-types-pages',
    imports: [],
    templateUrl: './types-pages.html',
    styleUrl: './types-pages.css',
    providers: [TypesStore],
})
export class TypesPages {
    readonly store = inject(TypesStore);

    typesList = allTypes;

    toggleTeam(type: TypePokemon) {
        this.store.toggleTeam(type);
    }
}
