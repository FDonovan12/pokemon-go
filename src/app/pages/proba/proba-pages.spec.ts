import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbaPages } from './proba-pages';

describe('ProbaPages', () => {
  let component: ProbaPages;
  let fixture: ComponentFixture<ProbaPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbaPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbaPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
