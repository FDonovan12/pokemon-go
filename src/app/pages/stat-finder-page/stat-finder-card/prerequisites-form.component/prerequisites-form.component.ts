import { Component, input, output } from '@angular/core';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { CardPrerequisites, IvComparison, IvMode } from '../../stat-finder.types';

@Component({
    selector: 'app-prerequisites-form',
    imports: [DropdownComponent],
    standalone: true,
    templateUrl: './prerequisites-form.component.html',
    styleUrl: './prerequisites-form.component.css',
})
export class PrerequisitesFormComponent {
    prerequisites = input.required<CardPrerequisites>();
    prerequisitesChange = output<Partial<CardPrerequisites>>();

    onLevelChange(value: number | null) {
        console.log('value', value);
        this.prerequisitesChange.emit({ level: !value ? null : Number(value) });
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

    readonly levels: { value: number; label: string }[] = [
        { value: 15, label: 'Étude' },
        { value: 20, label: 'Œuf / Raid' },
        { value: 25, label: 'Raid boost' },
    ];
}
