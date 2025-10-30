import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImagePokemon } from '@components/image-pokemon/image-pokemon';
import { PercentColor } from '@components/percent-color/percent-color';
import { TypeComponent } from '@components/type/type.component';
import { Dynamax, TypePokemon } from '@entities/pokemon';
import { PokemonDynamaxRepository } from '@repositories/pokemon/pokemon-dynamax';
import { TypeEffectivenessService } from '@services/type-effectiveness-service/type-effectiveness-service';
import { allTypes } from './../../entities/pokemon';

type resultDamage = { dynamax: Dynamax; damage: number; typeAttack: TypePokemon };

@Component({
    selector: 'app-dynamax.page',
    imports: [TypeComponent, ImagePokemon, PercentColor],
    templateUrl: './dynamax.page.html',
    styleUrl: './dynamax.page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamaxPage {
    private typeEffectivenessService = inject(TypeEffectivenessService);
    private pokemonDynamaxRepository = inject(PokemonDynamaxRepository);

    typesList = allTypes;

    result = new Map<TypePokemon, resultDamage[]>();

    addResultDamage(dynamax: Dynamax, typeOpponent: TypePokemon): void {
        if (!this.result.has(typeOpponent)) this.result.set(typeOpponent, []);
        const listDamage: resultDamage[] = this.result.get(typeOpponent)!;

        dynamax.attackType.forEach((typeAttack) => {
            const damage = this.getDamage(dynamax, typeAttack, typeOpponent);
            listDamage.push({ dynamax, damage, typeAttack });
        });
    }

    maxDamage = 0;

    ngOnInit(): void {
        this.typesList.forEach((type) => {
            (this.pokemonDynamaxRepository
                .getDynamaxPokemon()
                .forEach((dynamax) => this.addResultDamage(dynamax, type)),
                this.result.set(type, this.result.get(type)?.sortDesc('damage')!));
        });

        console.log(this.result);
    }

    getDamage(dynamax: Dynamax, typeAttck: TypePokemon, typeOpponent: TypePokemon): number {
        const typeAffinity = this.typeEffectivenessService.calculEffectivness(typeAttck, typeOpponent, typeOpponent);
        const stabMultiplier = dynamax.pokemon.type.includes(typeAttck) ? 1.2 : 1;
        const damage = dynamax.attack * typeAffinity * dynamax.damageAttack * stabMultiplier;
        this.maxDamage = Math.max(this.maxDamage, damage);
        return damage;
    }
}
