import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, output, signal, TemplateRef } from '@angular/core';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';

@Component({
    selector: 'app-dropdown',
    standalone: true,
    imports: [ClickOutsideDirective, NgTemplateOutlet],
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.css',
})
export class DropdownComponent<T> {
    value = input('');
    items = input<T[]>([]);

    placeholder = input('Rechercher...');

    selected = output<T>();
    valueChange = output<string>();

    itemTemplate = contentChild<TemplateRef<{ $implicit: T }>>('item');

    protected isOpen = signal(false);

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;

        this.valueChange.emit(value);
        this.isOpen.set(true);
    }

    onFocus() {
        this.isOpen.set(true);
    }

    select(item: T) {
        console.log('select');
        this.selected.emit(item);
        this.isOpen.set(false);
        console.log(this.isOpen());
    }

    close() {
        this.isOpen.set(false);
    }
}
