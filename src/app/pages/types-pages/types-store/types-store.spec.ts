import { TestBed } from '@angular/core/testing';

import { TypesStore } from './types-store';

describe('TypesStore', () => {
  let service: TypesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
