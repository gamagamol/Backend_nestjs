// karyawan/dto/create-karyawan.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';

export class CreateKaryawanDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  nomor: string;

  @IsString()
  @IsNotEmpty()
  jabatan: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsDateString()
  @IsNotEmpty()
  tanggal_masuk: string;

  // @IsNotEmpty()
  photo: File;

  @IsEnum(['CONTRACT', 'PERMANENT', 'PROBATION'])
  @IsNotEmpty()
  status: 'CONTRACT' | 'PERMANENT' | 'PROBATION';
}
