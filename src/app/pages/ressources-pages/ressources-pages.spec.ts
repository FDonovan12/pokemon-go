import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RessourcesPages } from './ressources-pages';

describe('RessourcesPages', () => {
  let component: RessourcesPages;
  let fixture: ComponentFixture<RessourcesPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RessourcesPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RessourcesPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
