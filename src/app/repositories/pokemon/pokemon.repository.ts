import { httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, resource } from '@angular/core';
import {
    Base,
    GenerationPokemon,
    LeagueStats,
    NamePokemon,
    PokemonFamily,
    PokemonInterface,
    PokemonSetting,
    PokemonSlug,
    RankPVP,
} from '@entities/pokemon';
import { ToastService } from '@shared/features/toast/toast.service';
import { pokemonsListHomeMade } from '../../bdd/bdd-home-made';
import pokemonsData from '../../bdd/bdd-pokemons.json';
import { familyPokemon } from '../../bdd/family-pokemon';
import { pokemonFamilyName } from '../../bdd/family-pokemon-name';
import { megaPokemon } from '../../bdd/mega-pokemon';

const pokemonsList = pokemonsData as PokemonInterface[];

interface PokemonIv {
    attack: number;
    defense: number;
    stamina: number;
}
type PokemonHomeMade = (typeof pokemonsListHomeMade)[number];

type PokemonIndex = {
    byId: Record<PokemonInterface['id'], PokemonInterface>;
    byName: Record<PokemonInterface['slug'], PokemonInterface>;
};

export type AllRankPVP = {
    great: LeagueStats[];
    ultra: LeagueStats[];
};
@Injectable({
    providedIn: 'root',
})
export class PokemonRepository {
    private readonly _toastService: ToastService = inject(ToastService);

    pokemonsSetting: HttpResourceRef<PokemonSetting[] | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokemon-setting.json',
    );
    cpMultiplier: HttpResourceRef<Record<string, number> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokemon/cp-multiplier.json',
    );
    rank1PVP: HttpResourceRef<Record<PokemonSlug, RankPVP> | undefined> = httpResource(
        () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/rank-1-pvp.json',
    );

    async getPVPRank(slug: PokemonSlug): Promise<AllRankPVP> {
        const result = await fetch(
            `https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/rank-pvp/${slug}.json`,
        );
        return result.json();
    }
    // rankPVP: HttpResourceRef<Record<PokemonSlug, test> | undefined> = httpResource(
    //     () => 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/rank-1-pvp.json',
    // );

    filteredPokemonsResource = resource({
        params: () => {
            const table = this.cpMultiplier.value();
            const pokemons = this.pokemonsSetting.value();

            if (!table || !pokemons) return undefined;
            return { table, pokemons };
        },
        // 2. La fonction de calcul prend directement la valeur émise par le stream
        // (Plus besoin de .request, l'argument reçu est directement ton objet)
        loader: async ({ params }) => {
            const { table, pokemons } = params;
            const IV_MAX = { attack: 15, defense: 15, stamina: 15 };

            return pokemons
                .map((form) => [form.base, ...form.different.map((different) => different.base)])
                .flat()
                .filter((pokemon) => {
                    const maxCp = this.pureCalculateCp(pokemon, table, IV_MAX, 50);
                    return maxCp > 1480;
                });
        },
    });

    pureCalculateCp(pokemon: Base, table: Record<string, number>, iv: PokemonIv, level: number): number {
        const cpm = table[level + ''];
        if (!cpm) return 10;

        const attackTotal = pokemon.stats.baseAttack + iv.attack;
        const defenseTotal = pokemon.stats.baseDefense + iv.defense;
        const staminaTotal = pokemon.stats.baseStamina + iv.stamina;

        const cp = Math.floor(
            (attackTotal * Math.sqrt(defenseTotal) * Math.sqrt(staminaTotal) * Math.pow(cpm, 2)) / 10,
        );

        return Math.max(10, cp);
    }

    // calculateCp(pokemon: Base, iv: PokemonIv, level: number): number {
    //     console.log(pokemon.slug);
    //     const table = this.getCPMultiplier();
    //     const cpm: number = table[level + ''];

    //     if (!cpm) {
    //         throw new Error(`CPM non trouvé pour le niveau ${level}. Vérifie ta table CPM.`);
    //     }

    //     const attackTotal = pokemon.stats.baseAttack + iv.attack;
    //     const defenseTotal = pokemon.stats.baseDefense + iv.defense;
    //     const staminaTotal = pokemon.stats.baseStamina + iv.stamina;

    //     const cp = Math.floor(
    //         (attackTotal * Math.sqrt(defenseTotal) * Math.sqrt(staminaTotal) * Math.pow(cpm, 2)) / 10,
    //     );

    //     return Math.max(10, cp);
    // }

    // async getPokemonSetting(): Promise<PokemonSetting[]> {
    //     console.log('getPokemonSetting');
    //     if (this.pokemonsSetting) return this.pokemonsSetting;
    //     const url = 'https://raw.githubusercontent.com/FDonovan12/pokemon-go-api/output/pokemon-setting.json';
    //     console.log(url);
    //     const res = await fetch(url);
    //     console.log('res');
    //     const data = (await res.json()) as PokemonSetting[];
    //     this.pokemonsSetting = data;
    //     return data;
    // }

    // async getPokemonSettingBySlug(slug: PokemonSlug): Promise<Base> {
    //     const pokemonSetting = this.getPokemonSetting();
    //     const flatData: Base[] = (await pokemonSetting)
    //         .map((pokemon) => {
    //             const base = pokemon.base;
    //             const diff = pokemon.different.map((d) => [d.base, ...d.same]).flat();
    //             const same = pokemon.same;
    //             return [base, ...diff, ...same].flat();
    //         })
    //         .flat();
    //     return flatData.find((pokemon) => pokemon.slug === slug)!;
    // }

    private buildPokemonIndex = (
        listFromAPI: PokemonInterface[],
        listHomemade: readonly PokemonHomeMade[] = [],
    ): PokemonIndex => {
        // console.log(this.enrichPokemonsGenerationAndFamily(listFromAPI));
        const list = [...listFromAPI, ...listHomemade] as PokemonInterface[];

        return {
            byId: Object.fromEntries(list.map((p) => [p.id, p])) as Record<PokemonInterface['id'], PokemonInterface>,
            byName: Object.fromEntries(list.map((p) => [p.slug, p])) as Record<
                PokemonInterface['slug'],
                PokemonInterface
            >,
        };
    };
    pokemonIndex = this.buildPokemonIndex(pokemonsList, pokemonsListHomeMade);

    getPokemonBySlug(slug: PokemonSlug): PokemonInterface {
        return this.pokemonIndex.byName[slug];
    }

    getPokemonByName(name: NamePokemon): PokemonInterface {
        console.log('name : ', name);
        return this.pokemonIndex.byName['Bulbizarre'];
    }

    getPokemonByFamily(family: PokemonFamily): PokemonInterface[] {
        return this.getAllPokemon().filter((pokemon) => pokemon.family === family);
    }

    getPokemonById(id: number): PokemonInterface | undefined {
        return this.pokemonIndex.byId[id];
    }

    getPokemonsBySLugs(slugs: PokemonSlug[]): PokemonInterface[] {
        const result: PokemonInterface[] = [];
        const errors: string[] = [];
        slugs.forEach((slug) => {
            const raw = this.getPokemonBySlug(slug);
            if (raw) result.push(raw);
            else errors.push(slug);
        });
        if (errors.length) {
            const toastMessage =
                "Les pokemon suivant non pas eté retrouver a cause d'une erreur reselectionné les a la main : " +
                errors.join(',');
            this._toastService.prepare('Erreur lors du chargment des pokemons', toastMessage).showError();
        }
        return result;
        // return this.pokemonIndex.byName[slug];
    }

    getAllPokemon(): PokemonInterface[] {
        return Object.entries(this.pokemonIndex.byId).map((couple) => couple[1]);
    }

    getAllOtherPokemons(pokemons: PokemonInterface[]): PokemonInterface[] {
        return this.getAllOtherPokemonsFromSLugs(pokemons.map((p) => p.slug));
    }

    getAllOtherPokemonsFromSLugs(pokemonsSlugs: PokemonSlug[]): PokemonInterface[] {
        const set: Set<PokemonSlug> = pokemonsSlugs.toSet();
        return this.getAllPokemon().filter((pokemon) => !set.has(pokemon.slug));
    }

    getAllPokemonSlugs(): PokemonSlug[] {
        return Object.entries(this.pokemonIndex.byName).map((couple) => couple[0] as PokemonSlug);
    }

    pokemonFamilyName = pokemonFamilyName;
    pokemonFamily = familyPokemon;

    starterPokemon = [
        this.pokemonIndex.byName.Bulbizarre,
        this.pokemonIndex.byName.Salameche,
        this.pokemonIndex.byName.Carapuce,
        this.pokemonIndex.byName.Germignon,
        this.pokemonIndex.byName.Hericendre,
        this.pokemonIndex.byName.Kaiminus,
        this.pokemonIndex.byName.Arcko,
        this.pokemonIndex.byName.Poussifeu,
        this.pokemonIndex.byName.Tortipouss,
        this.pokemonIndex.byName.Ouisticram,
        this.pokemonIndex.byName.Tiplouf,
        this.pokemonIndex.byName.Gobou,
        this.pokemonIndex.byName.Vipelierre,
        this.pokemonIndex.byName.Gruikui,
        this.pokemonIndex.byName.Moustillon,
        this.pokemonIndex.byName.Marisson,
        this.pokemonIndex.byName.Feunnec,
        this.pokemonIndex.byName.Grenousse,
        this.pokemonIndex.byName.Brindibou,
        this.pokemonIndex.byName.Flamiaou,
        this.pokemonIndex.byName.Otaquin,
        this.pokemonIndex.byName.Ouistempo,
        this.pokemonIndex.byName.Flambino,
        this.pokemonIndex.byName.Larmeleon,
        this.pokemonIndex.byName.Chochodile,
        this.pokemonIndex.byName.Poussacha,
        this.pokemonIndex.byName.Coiffeton,
    ];

    megaList = this.buildMegaList();

    private buildMegaList(): PokemonInterface[] {
        const listBase = megaPokemon;
        return listBase as PokemonInterface[];
    }
    async enrichPokemonsGenerationAndFamily(pokemons: PokemonInterface[]): Promise<PokemonInterface[]> {
        const base = 'https://pokeapi.co/api/v2';

        for (const p of pokemons) {
            try {
                const speciesRes = await fetch(`${base}/pokemon-species/${p.id}`);
                if (!speciesRes.ok) continue;
                const species = await speciesRes.json();

                // Génération (extraction du numéro depuis l'URL)
                const genUrl: string = species.generation.url;
                const genMatch = genUrl.match(/generation\/(\d+)\//);
                p.generation = (genMatch ? parseInt(genMatch[1], 10) : 0) as GenerationPokemon;

                // Récupère la chaîne d’évolution
                const evoChainUrl: string = species.evolution_chain.url;
                const evoRes = await fetch(evoChainUrl);
                if (!evoRes.ok) continue;
                const evoData = await evoRes.json();

                // Trouver l'espèce de base (anglais)
                const baseSpeciesName: string = evoData.chain.species.name;

                // Appel pour obtenir le nom français de l'espèce de base
                const baseSpeciesRes = await fetch(`${base}/pokemon-species/${baseSpeciesName}`);
                if (!baseSpeciesRes.ok) continue;
                const baseSpecies = await baseSpeciesRes.json();

                const frName = baseSpecies.names.find((n: any) => n.language.name === 'fr')?.name;
                if (!frName) continue;

                // Slugify + capitalize (selon ton projet)
                p.family = frName.slugify().capitalize();
            } catch {
                continue;
            }
        }
        return pokemons;
    }
}
