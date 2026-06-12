import { afterNextRender, Component, ElementRef, linkedSignal, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, min, validate } from '@angular/forms/signals';
import { PokemonInterface } from '@entities/pokemon';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { oneOf } from '@shared/validator/one-of';
import { Forme, League } from '../pvp-rank.type';

@Component({
    selector: 'app-modify-rank-dialog',
    templateUrl: './modify-rank-dialog.html',
    styleUrl: './modify-rank-dialog.css',

    imports: [FormsModule, ImagePokemon, FormField],
})
export class ModifyRankDialogComponent {
    rank = signal<number>(0);
    league = model.required<League>();
    forme = model.required<Forme>();
    pokemon = model.required<PokemonInterface>();

    formModel = linkedSignal(() => ({
        rank: this.rank(),
        league: this.league(),
        forme: this.forme(),
        pokemon: this.pokemon(),
    }));

    rankForm = form(this.formModel, (scheme) => {
        min(scheme.rank, 1);
        max(scheme.rank, 4096);
        validate(scheme.league, oneOf(['super', 'hyper'], 'Ligue Invalide'));
        validate(scheme.forme, oneOf(['normal', 'obscur'], 'Forme Invalide'));
    });

    submitted = output<{ rank: number; league: League; forme: Forme; pokemon: PokemonInterface }>();
    cancelled = output<void>();

    rankInput = viewChild<ElementRef<HTMLInputElement>>('rankInput');

    constructor() {
        afterNextRender(() => {
            const input = this.rankInput()?.nativeElement;
            console.log(input);
            if (input) {
                input.focus();
                input.select();
            }
        });
    }

    confirm() {
        this.rankForm().markAsTouched;
        if (this.rankForm().invalid()) return;
        this.submitted.emit(this.formModel());
    }

    cancel() {
        this.cancelled.emit();
    }
}
