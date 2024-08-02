import { Injectable } from '@nestjs/common';
import { Karyawan, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AgregatDepartment, AgregatStatus } from './karyawan.dto';

@Injectable()
export class KaryawanService {
  constructor(private prisma: PrismaService) {}

  async createKaryawan(data: Prisma.KaryawanCreateInput): Promise<Karyawan> {
    return this.prisma.karyawan.create({
      data,
    });
  }

  async getKaryawan(): Promise<Karyawan[]> {
    return this.prisma.karyawan.findMany();
  }

  async getKaryawanByNomor(nomor: string): Promise<Karyawan | null> {
    return this.prisma.karyawan.findFirst({
      where: { nomor },
    });
  }

  async getKaryawanById(id: number): Promise<Karyawan | null> {
    return this.prisma.karyawan.findUnique({
      where: { id },
    });
  }

  async updateKaryawan(
    id: number,
    data: Prisma.KaryawanUpdateInput,
  ): Promise<Karyawan> {
    return this.prisma.karyawan.update({
      where: { id },
      data,
    });
  }

  async deleteKaryawan(id: number): Promise<Karyawan> {
    return this.prisma.karyawan.delete({
      where: { id },
    });
  }

  async agregatStatus(): Promise<AgregatStatus[]> {
    const results = await this.prisma.karyawan.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return results.map((result) => ({
      jumlah: result._count.id,
      status: result.status,
    }));
  }

  async agregatDepartemen(): Promise<AgregatDepartment[]> {
    const results = await this.prisma.karyawan.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
    });

    return results.map((result) => ({
      jumlah: result._count.id,
      department: result.department,
    }));
  }
}
