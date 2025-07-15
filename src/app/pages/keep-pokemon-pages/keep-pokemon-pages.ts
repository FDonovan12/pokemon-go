import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { KeepStore } from './keep-store/keep-store';

@Component({
    selector: 'app-keep-pokemon-pages',
    imports: [FormsModule, ReactiveFormsModule, ImagePokemon],
    templateUrl: './keep-pokemon-pages.html',
    styleUrl: './keep-pokemon-pages.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeepPokemonPages {
    store = inject(KeepStore);
    @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

    constructor() {
        effect(() => {
            this.store.search();
            queueMicrotask(() => this.inputRef.nativeElement.focus());
        });
    }
}
