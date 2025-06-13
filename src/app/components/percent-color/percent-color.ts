import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

@Component({
    selector: '[app-percent-color]',
    imports: [],
    template: `
        {{ value() }} /
        {{ maximumValue() }}
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
    color = input<string>('lightblue');

    @HostBinding('style.--bg-gradient')
    get gradient(): string {
        const percent =
            this.maximumValue() === 0 ? 100 : Math.min(100, Math.max(0, (this.value() / this.maximumValue()) * 100));
        return `linear-gradient(to right, ${this.color()} ${percent}%, transparent ${percent}%)`;
    }
}
