import { Component, inject } from '@angular/core';
import { StatFinderCardComponent } from './stat-finder-card/stat-finder-card.component';
import { StatFinderPageStore } from './stats-finder-store/stat-finder-page.store';

@Component({
    selector: 'app-stat-finder-page',
    standalone: true,
    imports: [StatFinderCardComponent],
    templateUrl: './stat-finder-page.html',
    styleUrl: './stat-finder-page.css',
})
export class StatFinderPage {
    protected store = inject(StatFinderPageStore);
}
