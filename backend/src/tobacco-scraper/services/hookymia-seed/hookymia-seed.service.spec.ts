import { Test, TestingModule } from '@nestjs/testing';
import { HookymiaSeedService } from './hookymia-seed.service';

describe('HookymiaSeedService', () => {
  let service: HookymiaSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HookymiaSeedService],
    }).compile();

    service = module.get<HookymiaSeedService>(HookymiaSeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
