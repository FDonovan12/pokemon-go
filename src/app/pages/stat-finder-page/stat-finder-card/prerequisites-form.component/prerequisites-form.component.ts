import { Component, input, output } from '@angular/core';
import { SelectComponent } from '@shared/components/select/select.component';
import { CardPrerequisites, IvComparison, IvMode } from '../../stat-finder.types';

@Component({
    selector: 'app-prerequisites-form',
    imports: [SelectComponent],
    standalone: true,
    templateUrl: './prerequisites-form.component.html',
    styleUrl: './prerequisites-form.component.css',
})
export class PrerequisitesFormComponent {
    prerequisites = input.required<CardPrerequisites>();
    prerequisitesChange = output<Partial<CardPrerequisites>>();

    onLevelChange(value: string) {
        this.prerequisitesChange.emit({ level: value === '' ? null : Number(value) });
    }
    onLevelChange2(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.prerequisitesChange.emit({ level: value === '' ? null : Number(value) });
    }

    onCpChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.prerequisitesChange.emit({ cp: value === '' ? null : Number(value) });
    }

    setIvMode(mode: IvMode) {
        this.prerequisitesChange.emit({ iv: { ...this.prerequisites().iv, mode } });
    }

    setIvComparison(comparison: IvComparison) {
        this.prerequisitesChange.emit({ iv: { ...this.prerequisites().iv, comparison } });
    }

    onIvCommonChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.prerequisitesChange.emit({
            iv: { ...this.prerequisites().iv, common: value === '' ? null : Number(value) },
        });
    }

    onIvStatChange(stat: 'atk' | 'def' | 'sta', event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.prerequisitesChange.emit({
            iv: { ...this.prerequisites().iv, [stat]: value === '' ? null : Number(value) },
        });
    }

    readonly levels = [
        { value: '', label: 'Aucun' },
        { value: '15', label: 'Etude' },
        { value: '20', label: 'Oeuf / Raid' },
        { value: '25', label: 'Raid boost' },
    ];
}
