import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-log-range',
    standalone: true,
    template: `
        <div class="log-range">
            <div class="log-range__label">
                {{ label() }} :
                <span class="log-range__value">{{ value() }}</span>
            </div>
            <input
                type="range"
                [min]="0"
                [max]="100"
                [value]="toLinear(value())"
                (input)="onChange($event)"
            />
        </div>
    `,
    styles: [
        `
            .log-range {
                display: flex;
                flex-direction: column;
                gap: 4px;
                width: min(250px, 100%);
            }

            .log-range__value {
                font-weight: 600;
                display: inline-block;
                min-width: 4ch;
            }

            input[type='range'] {
                width: 100%;
            }
        `,
    ],
})
export class LogRangeComponent {
    label = input<string>('');
    value = input<number>(1);
    realMin = input<number>(1);
    realMax = input<number>(10000);
    valueChange = output<number>();

    toLinear(realValue: number): number {
        const scale = (Math.log(this.realMax()) - Math.log(this.realMin())) / 100;
        return Math.round((Math.log(realValue) - Math.log(this.realMin())) / scale);
    }

    toLog(linear: number): number {
        const scale = (Math.log(this.realMax()) - Math.log(this.realMin())) / 100;
        return Math.round(Math.exp(Math.log(this.realMin()) + scale * linear));
    }

    onChange(event: Event): void {
        const linear = +(event.target as HTMLInputElement).value;
        this.valueChange.emit(this.toLog(linear));
    }
}
