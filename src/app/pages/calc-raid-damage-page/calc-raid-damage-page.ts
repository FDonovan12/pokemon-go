import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MoveComponent } from '@shared/components/type/type-move.component';
import { TypeComponent } from '@shared/components/type/type.component';
import { CalcRaidStore } from './calc-raid-store/calc-raid-store';

@Component({
    selector: 'app-calc-raid-damage-page',
    imports: [TypeComponent, DecimalPipe, MoveComponent],
    templateUrl: './calc-raid-damage-page.html',
    styleUrl: './calc-raid-damage-page.css',
    host: {
        '[class.grid-container]': 'true',
        '[class.full-width]': 'true',
    },
})
export class CalcRaidDamagePage {
    protected readonly store = inject(CalcRaidStore);
}
