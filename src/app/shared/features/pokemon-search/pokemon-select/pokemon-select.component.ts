import { Component, inject, output, signal } from '@angular/core';
import { PokemonData } from '@entities/pokemon';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';
import { PokemonSelectStore } from './pokemon-select-store';

@Component({
    selector: 'app-pokemon-select',
    standalone: true,
    imports: [ClickOutsideDirective, ImagePokemon],
    providers: [PokemonSelectStore],
    templateUrl: './pokemon-select.component.html',
    styleUrl: './pokemon-select.component.css',
})
export class PokemonSelectComponent {
    protected store = inject(PokemonSelectStore);
    protected isOpen = signal(false);
    selected = output<PokemonData>();

    onInput(event: Event) {
        this.store.setSearch((event.target as HTMLInputElement).value);
        this.isOpen.set(true);
    }

    select(pokemon: PokemonData) {
        this.store.clearSearch();
        this.isOpen.set(false);
        this.selected.emit(pokemon);
    }
}
