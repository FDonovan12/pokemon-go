import { TestBed } from '@angular/core/testing';

import { PokemonRepository } from './pokemon.repository';

describe('GetAllService', () => {
    let service: PokemonRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PokemonRepository);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
