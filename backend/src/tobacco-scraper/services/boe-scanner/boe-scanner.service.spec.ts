import { Test, TestingModule } from '@nestjs/testing';
import { BoeScannerService } from './boe-scanner.service';

describe('BoeScannerService', () => {
  let service: BoeScannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoeScannerService],
    }).compile();

    service = module.get<BoeScannerService>(BoeScannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
