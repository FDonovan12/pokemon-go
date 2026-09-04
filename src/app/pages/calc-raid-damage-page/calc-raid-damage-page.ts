import { Component, inject } from '@angular/core';
import { CalcRaidStore } from './calc-raid-store/calc-raid-store';

@Component({
    selector: 'app-calc-raid-damage-page',
    imports: [],
    templateUrl: './calc-raid-damage-page.html',
    styleUrl: './calc-raid-damage-page.css',
})
export class CalcRaidDamagePage {
    protected readonly store = inject(CalcRaidStore);
}
