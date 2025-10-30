import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

@Component({
    selector: '[app-percent-color]',
    imports: [],
    template: `
        @if (viewPercent()) {
            {{ ((value() / maximumValue()) * 100).toFixed(2) }}%
        } @else {
            {{ value() }} /
            {{ maximumValue() }}
        }
    `,
    styles: `
        :host {
            background: var(--bg-gradient, lightgray);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PercentColor {
    value = input.required<number>();
    maximumValue = input.required<number>();
    viewPercent = input<boolean>(false);
    color = input<string>('lightblue');

    @HostBinding('style.--bg-gradient')
    get gradient(): string {
        const rawPercent = this.maximumValue() === 0 ? 100 : (this.value() / this.maximumValue()) * 100;
        const percent = Math.min(100, Math.max(0, rawPercent));
        return `linear-gradient(to right, ${this.color()} ${percent}%, transparent ${percent}%)`;
    }
}
