// modify-rank-dialog.component.ts
import { afterNextRender, Component, ElementRef, EventEmitter, model, Output, signal, viewChild } from '@angular/core';
import { Form, League } from '../pvp-rank';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-modify-rank-dialog',
    templateUrl: './modify-rank-dialog.html',
    styleUrl: './modify-rank-dialog.css',
    imports: [FormsModule],
})
export class ModifyRankDialogComponent {
    rank = signal<number>(1);
    league = model.required<League>();
    form = model.required<Form>();

    @Output() submitted = new EventEmitter<{ rank: number; league: League; form: Form }>();
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
        this.submitted.emit({ rank: this.rank(), league: this.league(), form: this.form() });
    }

    cancel() {
        this.cancelled.emit();
    }
}
