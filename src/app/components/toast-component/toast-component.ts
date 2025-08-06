import { Component, inject } from '@angular/core';
import { ClipboardService } from '@services/clipboard-service/clipboard-service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast-component',
    imports: [],
    template: `
        @if (visible) {
            <div class="toast">
                {{ message }}
            </div>
        }
    `,
    styles: `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            opacity: 0.95;
            transition: opacity 0.3s ease;
        }
    `,
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
    private readonly clipboardService: ClipboardService = inject(ClipboardService);
    message = '';
    visible = false;
    private sub?: Subscription;
    ngOnInit(): void {
        console.log('init toast');
        this.sub = this.clipboardService.copyFeedback$.subscribe((msg) => {
            this.message = msg;
            this.visible = true;

            setTimeout(() => (this.visible = false), 2000);
        });
    }
    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
