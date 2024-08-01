import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Karyawan, Prisma } from '@prisma/client';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as XLSX from 'xlsx';
import { CreateKaryawanDto } from './karyawan.dto';
import { KaryawanService } from './karyawan.service';

export const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const extension = extname(file.originalname);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return callback(null, `${name}-${randomName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new HttpException(
        'Silahkan Masukan Tipe File JPG,PNG atau JPEG',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
};

const limits = {
  fileSize: 1 * 1024 * 1024, // 1 MB
};

@Controller('karyawan')
export class KaryawanController {
  constructor(private readonly karyawanService: KaryawanService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter, limits }))
  async createEmployee(
    @Body() data: CreateKaryawanDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Karyawan> {
    const newKaryawan: Prisma.KaryawanCreateInput = {
      nama: data.nama,
      nomor: data.nomor,
      jabatan: data.jabatan,
      department: data.department,
      tanggal_masuk: new Date(data.tanggal_masuk),
      photo: file.filename,
      status: data.status,
      created_at: new Date(),
    };

    // check duplikat nomor pegawai yang sama
    let duplikat_karyawan = await this.karyawanService.getKaryawanByNomor(
      data.nomor,
    );

    if (duplikat_karyawan) {
      throw new HttpException(
        'Nomor pegawai sudah ada.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.karyawanService.createKaryawan(newKaryawan);
  }

  @Get()
  async getEmployees(): Promise<Karyawan[]> {
    return this.karyawanService.getKaryawan();
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter, limits }))
  async updateKaryawan(
    @Param('id') id: string,
    @Body() data: CreateKaryawanDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Karyawan> {
    const updateData: Prisma.KaryawanUpdateInput = {
      nama: data.nama,
      nomor: data.nomor,
      jabatan: data.jabatan,
      department: data.department,
      tanggal_masuk: new Date(data.tanggal_masuk),
      photo: file.filename,
      status: data.status,
      updated_at: new Date(),
    };

    return this.karyawanService.updateKaryawan(Number(id), updateData);
  }

  @Delete(':id')
  async deleteKaryawan(@Param('id') id: string): Promise<Karyawan> {
    return this.karyawanService.deleteKaryawan(Number(id));
  }

  @Get('export')
  async exportToExcel(@Res() res: Response): Promise<void> {
    try {
      const data = await this.karyawanService.getKaryawan();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Tentukan path untuk menyimpan file
      const filePath = './uploads/exported-karyawan.xlsx';

      XLSX.writeFile(wb, filePath);

      res.status(HttpStatus.OK).json({
        message: 'Success exporting to Excel',
        status: HttpStatus.OK,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed exporting to Excel',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
