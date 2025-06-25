import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeepPokemonPages } from './keep-pokemon-pages';

describe('KeepPokemonPages', () => {
  let component: KeepPokemonPages;
  let fixture: ComponentFixture<KeepPokemonPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeepPokemonPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeepPokemonPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
