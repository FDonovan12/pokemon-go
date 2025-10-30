import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamaxPage } from './dynamax.page';

describe('DynamaxPage', () => {
  let component: DynamaxPage;
  let fixture: ComponentFixture<DynamaxPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamaxPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamaxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
