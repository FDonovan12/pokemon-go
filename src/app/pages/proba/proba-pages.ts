import { Component } from '@angular/core';

@Component({
    selector: 'app-proba-pages',
    imports: [],
    templateUrl: './proba-pages.html',
    styleUrl: './proba-pages.css',
})
export class ProbaPages {
    findProba(minTotal: number, minFirstNumber = 0) {
        const dices = Array.range(6);
        let countGood = 0;
        dices.forEach((first) =>
            dices.forEach((second) =>
                dices.forEach((third) => {
                    if (first + second + third >= minTotal && first >= minFirstNumber) countGood++;
                }),
            ),
        );
        return `${countGood} / ${6 * 6 * 6}`;
    }
}
