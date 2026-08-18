import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
    selector: '[appClickOutside]',
    standalone: true,
})
export class ClickOutsideDirective {
    private elementRef = inject(ElementRef);
    clickOutside = output<void>();

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside) {
            this.clickOutside.emit();
        }
    }
}
