import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, output, signal, TemplateRef } from '@angular/core';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';

export interface SelectOption<T> {
    value: T;
    label: string;
}

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [NgTemplateOutlet, ClickOutsideDirective],
    templateUrl: './select.component.html',
    styleUrl: './select.component.css',
})
export class SelectComponent<T> {
    value = input<T | null>(null);
    options = input<SelectOption<T>[]>([]);

    placeholder = input('Sélectionner...');

    valueChange = output<T>();

    optionTemplate = contentChild<TemplateRef<{ $implicit: SelectOption<T> }>>('option');

    protected isOpen = signal(false);

    protected toggle() {
        this.isOpen.update((value) => !value);
    }

    protected close() {
        this.isOpen.set(false);
    }

    protected select(option: SelectOption<T>) {
        this.valueChange.emit(option.value);
        this.close();
    }

    protected selectedOption() {
        return this.options().find((option) => option.value === this.value());
    }
}
