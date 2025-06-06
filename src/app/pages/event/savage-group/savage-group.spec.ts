import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavageGroup } from './savage-group';

describe('SavageGroup', () => {
  let component: SavageGroup;
  let fixture: ComponentFixture<SavageGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavageGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavageGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
