import {
    afterNextRender,
    Component,
    ElementRef,
    HostListener,
    inject,
    input,
    linkedSignal,
    viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { FilterFolder, FiltersFacade } from '@repositories/filters-repository';

@Component({
    selector: 'app-add-folder',
    standalone: true,
    imports: [FormField, FormsModule],
    templateUrl: './add-folder.page.html',
    styleUrl: './add-folder.page.css',
})
export class AddFolderPage {
    private readonly router = inject(Router);
    private readonly _filtersFacade = inject(FiltersFacade);

    readonly folder = input<FilterFolder | undefined>();
    private readonly labelInput = viewChild<ElementRef<HTMLInputElement>>('labelInput');

    constructor() {
        afterNextRender(() => {
            this.labelInput()?.nativeElement.focus();
        });
    }
    readonly folderForm = form(
        linkedSignal(() => ({ label: this.folder()?.label ?? '' })),
        (path) => {
            required(path.label, { message: 'Le nom est requis' });
        },
    );

    @HostListener('mousedown', ['$event'])
    onHostClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.cancel();
        }
    }
    cancel(): void {
        this.router.navigate(['/']);
    }

    save(): void {
        this.folderForm().markAsTouched();
        if (this.folderForm().invalid()) return;

        const existing = this.folder();
        const label = this.folderForm.label().value();

        if (existing) {
            this._filtersFacade.updateFolder(existing.id, { label });
        } else {
            this._filtersFacade.addFolder(label);
        }
        this.router.navigate(['/']);
    }
}
