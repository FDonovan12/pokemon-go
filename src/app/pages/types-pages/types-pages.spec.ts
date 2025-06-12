import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesPages } from './types-pages';

describe('TypesPages', () => {
  let component: TypesPages;
  let fixture: ComponentFixture<TypesPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypesPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
