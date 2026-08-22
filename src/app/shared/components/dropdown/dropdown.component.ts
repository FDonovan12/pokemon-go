import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, model, output, signal, TemplateRef } from '@angular/core';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';

@Component({
    selector: 'app-dropdown',
    standalone: true,
    imports: [ClickOutsideDirective, NgTemplateOutlet],
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.css',
})
export class DropdownComponent<TValue, TItem> {
    value = model.required<TValue | null>();
    items = input.required<TItem[]>();
    inputType = input<'text' | 'number' | 'date'>('text');
    id = input<string>(crypto.randomUUID());

    placeholder = input('Rechercher...');

    selected = output<TItem>();

    itemTemplate = contentChild<TemplateRef<{ $implicit: TItem }>>('item');

    protected isOpen = signal(false);

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value as TValue;
        this.value.set(value);
        this.isOpen.set(true);
    }

    onFocus() {
        this.isOpen.set(true);
    }

    select(item: TItem) {
        console.log(this.value(), typeof this.value());
        console.log('select');
        this.selected.emit(item);
        this.isOpen.set(false);
        console.log(this.isOpen());
    }

    close() {
        this.isOpen.set(false);
    }
}
