import { Test, TestingModule } from '@nestjs/testing';
import { TobaccoCronService } from './tobacco-cron.service';

describe('TobaccoCronService', () => {
  let service: TobaccoCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TobaccoCronService],
    }).compile();

    service = module.get<TobaccoCronService>(TobaccoCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
