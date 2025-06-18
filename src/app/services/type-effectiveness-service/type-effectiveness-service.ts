import { Injectable } from '@angular/core';
import { TypePokemon } from '@entities/pokemon';
import { damageRelation } from './table-damage-relation';

@Injectable({
    providedIn: 'root',
})
export class TypeEffectivenessService {
    private typeEffectiveness?: Map<TypePokemon, Map<TypePokemon, number>>;

    ngOnInit(): void {
        this.typeEffectiveness = this.getDamageRelations();
        this.isInitialized = true;
    }
    private isInitialized = false;
    private initPromise?: Promise<void>;

    async initIfNeeded(): Promise<void> {
        if (this.isInitialized) return;

        if (!this.initPromise) {
            const map = this.getDamageRelations();
            this.typeEffectiveness = map;
            this.isInitialized = true;
        }

        return this.initPromise;
    }

    calculEffectivness(attacker: TypePokemon, type1: TypePokemon, type2: TypePokemon): number {
        const eff1 = this.getDamageRelations().get(attacker)?.get(type1) ?? 1;
        let eff2 = 1;
        if (type1 !== type2) eff2 = this.getDamageRelations().get(attacker)?.get(type2) ?? 1;
        const combinedEff = eff1 * eff2;
        return combinedEff;
    }

    getDamageRelations(): Map<TypePokemon, Map<TypePokemon, number>> {
        if (!this.typeEffectiveness) {
            const table: [TypePokemon, [TypePokemon, number][]][] = damageRelation;
            this.typeEffectiveness = new Map(
                table.map(([key, innerArr]) => [key, new Map<TypePokemon, number>(innerArr)]),
            );
        }
        return this.typeEffectiveness;
    }

    getWeaknessesOf(defender: TypePokemon): TypePokemon[] {
        if (!this.typeEffectiveness) return [];
        return Array.from(this.typeEffectiveness.entries())
            .filter(([, map]) => (map.get(defender) ?? 1) > 1)
            .map(([attacker]) => attacker);
    }
    getResistancesOf(defender: TypePokemon): TypePokemon[] {
        if (!this.typeEffectiveness) return [];
        return Array.from(this.typeEffectiveness.entries())
            .filter(([, map]) => (map.get(defender) ?? 1) < 1)
            .map(([attacker]) => attacker);
    }

    getTypesWeakTo(attacker: TypePokemon): TypePokemon[] {
        const map = this.getDamageRelations().get(attacker);
        if (!map) return [];
        return Array.from(map.entries())
            .filter(([, multiplier]) => multiplier > 1)
            .map(([defender]) => defender);
    }

    getTypesResistantTo(attacker: TypePokemon): TypePokemon[] {
        const map = this.getDamageRelations().get(attacker);
        if (!map) return [];
        return Array.from(map.entries())
            .filter(([, multiplier]) => multiplier < 1)
            .map(([defender]) => defender);
    }

    async fetchDamageRelations() {
        const typesCount = new Map<TypePokemon, Map<TypePokemon, number>>();

        for (const [frType, enType] of Object.entries(this.typeMapFrToEn)) {
            const response = await fetch(`https://pokeapi.co/api/v2/type/${enType}`);
            const data = await response.json();

            const innerMap = new Map<TypePokemon, number>();

            // Init à 1 par défaut (neutre)
            for (const defType of Object.keys(this.typeMapFrToEn) as TypePokemon[]) {
                innerMap.set(defType, 1);
            }

            const update = (arr: any[], value: number) => {
                for (const type of arr) {
                    const targetFr = Object.entries(this.typeMapFrToEn).find(([, v]) => v === type.name)?.[0];
                    if (targetFr) innerMap.set(targetFr as TypePokemon, value);
                }
            };

            update(data.damage_relations.double_damage_to, 2);
            update(data.damage_relations.half_damage_to, 0.5);
            update(data.damage_relations.no_damage_to, 0);

            typesCount.set(frType as TypePokemon, innerMap);
        }
        const table = Array.from(typesCount.entries()).map(([key, innerMap]) => [key, Array.from(innerMap.entries())]);
        return typesCount;
    }
    typeMapFrToEn: Record<TypePokemon, string> = {
        Acier: 'steel',
        Combat: 'fighting',
        Dragon: 'dragon',
        Eau: 'water',
        Électrik: 'electric',
        Fée: 'fairy',
        Feu: 'fire',
        Glace: 'ice',
        Insecte: 'bug',
        Normal: 'normal',
        Plante: 'grass',
        Poison: 'poison',
        Psy: 'psychic',
        Roche: 'rock',
        Sol: 'ground',
        Spectre: 'ghost',
        Ténèbres: 'dark',
        Vol: 'flying',
    };
}
