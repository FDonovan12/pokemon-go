import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { StatFinderCardComponent } from './stat-finder-card/stat-finder-card.component';
import { StatFinderPageStore } from './stats-finder-store/stat-finder-page.store';

@Component({
    selector: 'app-stat-finder-page',
    standalone: true,
    imports: [StatFinderCardComponent, CdkDropList, CdkDrag],
    templateUrl: './stat-finder-page.html',
    styleUrl: './stat-finder-page.css',
    host: {
        '[class.grid-container]': 'true',
        '[class.full-width]': 'true',
    },
})
export class StatFinderPage {
    protected store = inject(StatFinderPageStore);

    onDrop(event: CdkDragDrop<unknown>) {
        this.store.reorderCards(event.previousIndex, event.currentIndex);
    }
}
