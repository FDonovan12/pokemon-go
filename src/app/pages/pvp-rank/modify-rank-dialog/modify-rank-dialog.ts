import { afterNextRender, Component, ElementRef, EventEmitter, model, Output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Forme, League } from '../pvp-rank.type';

@Component({
    selector: 'app-modify-rank-dialog',
    templateUrl: './modify-rank-dialog.html',
    styleUrl: './modify-rank-dialog.css',

    imports: [FormsModule],
})
export class ModifyRankDialogComponent {
    rank = signal<number>(1);
    league = model.required<League>();
    forme = model.required<Forme>();

    @Output() submitted = new EventEmitter<{ rank: number; league: League; forme: Forme }>();
    @Output() cancelled = new EventEmitter<void>();

    rankInput = viewChild<ElementRef<HTMLInputElement>>('rankInput');

    constructor() {
        afterNextRender(() => {
            const input = this.rankInput()?.nativeElement;
            if (input) {
                input.focus();
                input.select();
            }
        });
    }

    confirm() {
        if (this.rank() < 1 || this.rank() > 4096) return alert('Rank doit être entre 1 et 4096');
        this.submitted.emit({ rank: this.rank(), league: this.league(), forme: this.forme() });
    }

    cancel() {
        this.cancelled.emit();
    }
}
