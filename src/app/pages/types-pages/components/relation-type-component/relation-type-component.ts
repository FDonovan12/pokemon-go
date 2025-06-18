import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TypePokemon } from '@entities/pokemon';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';
import { TypeComponent } from '../../../../components/type/type.component';

@Component({
    selector: 'app-relation-type-component',
    imports: [TypeComponent],
    templateUrl: 'relation-type-component.html',
    styles: `
        .type-rows {
            display: grid;
            grid-column: span 3;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelationTypeComponent {
    currentType = input.required<TypePokemon>();

    private readonly typeEffectivenessService = inject(TypeEffectivenessService);

    resistanceOfCurrentType = computed(() => this.typeEffectivenessService.getResistancesOf(this.currentType()));
    resistanceToCurrentType = computed(() => this.typeEffectivenessService.getTypesResistantTo(this.currentType()));
    weaknessesOfCurrentType = computed(() => this.typeEffectivenessService.getWeaknessesOf(this.currentType()));
    weaknessesToCurrentType = computed(() => this.typeEffectivenessService.getTypesWeakTo(this.currentType()));

    ngOnInit(): void {
        this.typeEffectivenessService.initIfNeeded();
    }
}
