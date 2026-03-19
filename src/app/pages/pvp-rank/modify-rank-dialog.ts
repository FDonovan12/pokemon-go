// modify-rank-dialog.component.ts
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
    selector: 'app-modify-rank-dialog',
    template: `
        <div class="dialog-backdrop">
            <div class="dialog">
                <h3>Modifier le Rank</h3>
                <label>
                    Rank (1-4096):
                    <input
                        type="number"
                        [value]="rank()"
                        (input)="rank.set($any($event.target).valueAsNumber)"
                        min="1"
                        max="4096"
                    />
                </label>
                <label>
                    Ligue:
                    <select
                        [value]="league()"
                        (change)="league.set($any($event.target).value)"
                    >
                        <option value="super">Super</option>
                        <option value="hyper">Hyper</option>
                    </select>
                </label>
                <label>
                    Forme:
                    <select
                        [value]="form()"
                        (change)="form.set($any($event.target).value)"
                    >
                        <option value="normal">Normal</option>
                        <option value="obscur">Obscur</option>
                    </select>
                </label>
                <div class="buttons">
                    <button (click)="confirm()">Confirmer</button>
                    <button (click)="cancel()">Annuler</button>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .dialog-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .dialog {
                background: white;
                padding: 1rem;
                border-radius: 0.5rem;
                min-width: 200px;
            }
            .buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 1rem;
            }
            label {
                display: block;
                margin-top: 0.5rem;
            }
        `,
    ],
})
export class ModifyRankDialogComponent {
    rank = signal<number>(1);
    league = signal<'super' | 'hyper'>('super');
    form = signal<'obscur' | 'normal'>('normal');

    @Output() submitted = new EventEmitter<{ rank: number; league: 'super' | 'hyper'; form: 'obscur' | 'normal' }>();
    @Output() cancelled = new EventEmitter<void>();

    confirm() {
        if (this.rank() < 1 || this.rank() > 4096) return alert('Rank doit être entre 1 et 4096');
        this.submitted.emit({ rank: this.rank(), league: this.league(), form: this.form() });
    }

    cancel() {
        this.cancelled.emit();
    }
}
