import { PokemonInterface, typePokemon } from '@entities/pokemon';

export class EventPokemon {
    public slug: string;

    constructor(
        public name: string,
        public startAt: Date,
        public endAt: Date,
        public savageGroups: SavageGroup[],
        public eggPokemons?: PokemonInterface[],
        public raidPokemons?: PokemonInterface[],
    ) {
        this.slug = this.name.slugify();
    }

    get allSavagePokemons(): PokemonWithRarity[] {
        return this.savageGroups.flatMap((group) => group.pokemons);
    }

    get rareSavagePokemons(): PokemonWithRarity[] {
        return this.savageGroups.flatMap((group) => group.rarePokemons);
    }
}

export class SavageGroup {
    public pokemons: PokemonWithRarity[];

    constructor(
        pokemons: (PokemonWithRarity | PokemonInterface)[],
        public title: string | undefined = undefined,
        public megas: PokemonInterface[] = [],
    ) {
        this.pokemons = pokemons.map((p) => (p instanceof PokemonWithRarity ? p : new PokemonWithRarity(p)));
    }

    get rarePokemons(): PokemonWithRarity[] {
        return this.pokemons.filter((p) => p.isRare);
    }

    get commonPokemons(): PokemonWithRarity[] {
        return this.pokemons.filter((p) => !p.isRare);
    }
}

export class PokemonWithRarity {
    constructor(public pokemon: PokemonInterface, public isRare: boolean = false) {}

    get name(): string {
        return this.pokemon.name;
    }

    get type(): typePokemon[] {
        return this.pokemon.type;
    }
}
