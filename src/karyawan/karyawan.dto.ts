// karyawan/dto/create-karyawan.dto.ts
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  foto: File;

  @IsEnum(['CONTRACT', 'PERMANENT', 'PROBATION'])
  @IsNotEmpty()
  status: 'CONTRACT' | 'PERMANENT' | 'PROBATION';
}

export class DashboardDTO {
  AgregatStatus;
  AgregatDepartment;
}

export class AgregatStatus {
  jumlah: number;
  status: string;
}

export class AgregatDepartment {
  jumlah: number;
  department: string;
}
