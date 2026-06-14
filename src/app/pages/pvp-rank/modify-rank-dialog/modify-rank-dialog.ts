import {
    afterNextRender,
    Component,
    computed,
    ElementRef,
    inject,
    linkedSignal,
    model,
    output,
    Signal,
    viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, min, validate } from '@angular/forms/signals';
import { PokemonInterface } from '@entities/pokemon';
import { ImagePokemon } from '@shared/components/image-pokemon/image-pokemon';
import { PVPRankStore } from '../pvp-rank-store/pvp-rank-store';
import { Forme, League } from '../pvp-rank.type';

@Component({
    selector: 'app-modify-rank-dialog',
    templateUrl: './modify-rank-dialog.html',
    styleUrl: './modify-rank-dialog.css',

    imports: [FormsModule, ImagePokemon, FormField],
})
export class ModifyRankDialogComponent {
    protected readonly store = inject(PVPRankStore);
    league = model.required<League>();
    forme = model.required<Forme>();
    pokemon = model.required<PokemonInterface>();
    rank: Signal<number> = computed(
        () => this.store.getRankPokemon(this.pokemon().slug, this.league(), this.forme()) ?? 0,
    );

    formModel = linkedSignal(() => ({
        rank: this.rank(),
        league: this.league(),
        forme: this.forme(),
        pokemon: this.pokemon(),
    }));

    rankForm = form(this.formModel, (scheme) => {
        min(scheme.rank, 1);
        max(scheme.rank, 4096, { message: 'Ligue Invalide' });
        // oneOf(scheme.league, ['super', 'hyper']);
        validate(scheme.league, ({ value }) => {
            return ['super', 'hyper'].includes(value()) ? null : { kind: 'oneOf', message: 'Ligue Invalide' };
        });
        validate(scheme.forme, ({ value }) => {
            return ['normal', 'obscur'].includes(value()) ? null : { kind: 'oneOf', message: 'Forme Invalide' };
        });
        // validate(scheme.league, oneOf(['super', 'hyper'], 'Ligue Invalide'));
        // validate(scheme.forme, oneOf(['normal', 'obscur'], 'Forme Invalide'));
    });

    closed = output<void>();

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
        const { pokemon, rank, league, forme } = this.formModel();
        this.store.modifyRank(pokemon.slug, rank, league, forme);
        this.closed.emit();
    }

    removeRank() {
        const { pokemon, rank, league, forme } = this.formModel();
        this.store.removeRank(pokemon.slug, league, forme);
        this.closed.emit();
    }

    cancel() {
        this.closed.emit();
    }
}
