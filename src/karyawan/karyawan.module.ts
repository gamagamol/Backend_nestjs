import { Module } from '@nestjs/common';
import { KaryawanController } from './karyawan.controller';
import { KaryawanService } from './karyawan.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  controllers: [KaryawanController],
  providers: [KaryawanService],
  imports:[PrismaModule]
})
export class KaryawanModule {}
