import { Directive, HostListener, output } from '@angular/core';

@Directive({
    selector: '[swipeGesture]',
})
export class SwipeGestureDirective {
    readonly swipeLeft = output<void>();
    readonly swipeRight = output<void>();

    private startX = 0;
    private startY = 0;
    private readonly threshold = 50; // px minimum pour valider le swipe
    private readonly maxVerticalDrift = 60; // au-delà, on considère que c'est un scroll vertical

    @HostListener('document:touchstart', ['$event'])
    onTouchStart(event: TouchEvent): void {
        console.log('start');
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }

    @HostListener('document:touchend', ['$event'])
    onTouchEnd(event: TouchEvent): void {
        const deltaX = event.changedTouches[0].clientX - this.startX;
        const deltaY = Math.abs(event.changedTouches[0].clientY - this.startY);

        if (deltaY > this.maxVerticalDrift) return;

        if (deltaX > this.threshold) this.swipeRight.emit();
        else if (deltaX < -this.threshold) this.swipeLeft.emit();
    }
}
