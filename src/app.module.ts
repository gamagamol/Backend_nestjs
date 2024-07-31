import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KaryawanModule } from './karyawan/karyawan.module';

@Module({
  imports: [KaryawanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
