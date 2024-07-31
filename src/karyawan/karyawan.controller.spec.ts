import { Test, TestingModule } from '@nestjs/testing';
import { KaryawanController } from './karyawan.controller';

describe('KaryawanController', () => {
  let controller: KaryawanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KaryawanController],
    }).compile();

    controller = module.get<KaryawanController>(KaryawanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
