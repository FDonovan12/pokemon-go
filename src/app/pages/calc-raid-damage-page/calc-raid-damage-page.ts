import { Component, inject } from '@angular/core';
import { TypeComponent } from '@shared/components/type/type.component';
import { CalcRaidStore } from './calc-raid-store/calc-raid-store';

@Component({
    selector: 'app-calc-raid-damage-page',
    imports: [TypeComponent],
    templateUrl: './calc-raid-damage-page.html',
    styleUrl: './calc-raid-damage-page.css',
    host: {
        style: 'display: contents',
    },
})
export class CalcRaidDamagePage {
    protected readonly store = inject(CalcRaidStore);
}
