import { Component, inject, output } from '@angular/core';
import { Base } from '@entities/pokemon';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PokemonSelectStore } from './pokemon-select-store';

@Component({
    selector: 'app-pokemon-select',
    standalone: true,
    imports: [DropdownComponent, ImagePokemon],
    providers: [PokemonSelectStore],
    templateUrl: './pokemon-select.component.html',
    styleUrl: './pokemon-select.component.css',
})
export class PokemonSelectComponent {
    protected store = inject(PokemonSelectStore);
    selected = output<Base>();

    onSearch(value: string) {
        this.store.setSearch(value);
    }

    select(pokemon: Base) {
        this.store.clearSearch();
        this.selected.emit(pokemon);
    }
}
