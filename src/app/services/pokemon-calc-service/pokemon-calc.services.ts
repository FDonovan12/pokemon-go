import { Injectable } from '@angular/core';
import { Stats } from '@entities/pokemon';
import { Combo, IV } from '@entities/stats';

@Injectable({
    providedIn: 'root',
})
export class PokemonCalcService {
    calcCp(stats: Stats, iv: Combo<IV>, cpm: number): number {
        const attackTotal = stats.baseAttack + iv.attack;
        const defenseTotal = stats.baseDefense + iv.defense;
        const staminaTotal = stats.baseStamina + iv.stamina;

        const cp = Math.floor((attackTotal * Math.sqrt(defenseTotal) * Math.sqrt(staminaTotal) * cpm ** 2) / 10);

        return Math.max(10, cp);
    }
}
