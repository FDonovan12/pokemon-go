import { TestBed } from '@angular/core/testing';

import { TypeEffectivenessService } from './type-effectiveness-service';

describe('TypeEffectivenessService', () => {
  let service: TypeEffectivenessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeEffectivenessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
