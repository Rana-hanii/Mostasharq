import { TestBed } from '@angular/core/testing';

import { FixflowbiteService } from './fixflowbite.service';

describe('FixflowbiteService', () => {
  let service: FixflowbiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixflowbiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
