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
import {
  CreateKaryawanDto,
  DashboardDTO,
  UpdateKaryawanDto,
} from './karyawan.dto';
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
  @UseInterceptors(FileInterceptor('foto', { storage, fileFilter, limits }))
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
      foto: file.filename,
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

  @Get('/dashboard')
  async Dashboard(): Promise<DashboardDTO> {
    const responseDashboard: DashboardDTO = {
      AgregatDepartment: await this.karyawanService.agregatDepartemen(),
      AgregatStatus: await this.karyawanService.agregatStatus(),
    };

    return responseDashboard;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('foto', { storage, fileFilter, limits }))
  async updateKaryawan(
    @Param('id') id: string,
    @Body() data: UpdateKaryawanDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Karyawan> {
    const updateData: Prisma.KaryawanUpdateInput = {
      nama: data.nama,
      nomor: data.nomor,
      jabatan: data.jabatan,
      department: data.department,
      status: data.status,
      updated_at: new Date(),
    };

    if (file) {
      updateData.foto = file.filename;
    }
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

  getJsDateFromExcel(excelDate) {
    const SECONDS_IN_DAY = 24 * 60 * 60;
    const MISSING_LEAP_YEAR_DAY = SECONDS_IN_DAY * 1000;
    const MAGIC_NUMBER_OF_DAYS = 25567 + 2;
    if (!Number(excelDate)) {
      alert('wrong input format');
    }

    const delta = excelDate - MAGIC_NUMBER_OF_DAYS;
    const parsed = delta * MISSING_LEAP_YEAR_DAY;
    const date = new Date(parsed);

    return date;
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<void> {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    let status_type = {
      kontrak: 'CONTRACT',
      tetap: 'PERMANENT',
      probation: 'PROBATION',
    };

    try {
      const filePath = './uploads/' + file.filename;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: CreateKaryawanDto[] = XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
        },
      );

      const headers = jsonData[0];
      const rows = jsonData.slice(1);

      rows.forEach((row) => {
        let nama: string = row[0];
        let nomor: string = '' + row[1];
        let jabatan: string = row[2];
        let departemen: string = row[3];
        let tanggal_masuk: Date = this.getJsDateFromExcel(row[4]);
        let foto: string = row[5];
        let status = status_type[row[6]];

        const newKaryawan: Prisma.KaryawanCreateInput = {
          nama: nama,
          nomor: nomor,
          jabatan: jabatan,
          department: departemen,
          tanggal_masuk: tanggal_masuk,
          foto: foto,
          status: status,
          created_at: new Date(),
        };

        this.karyawanService.createKaryawan(newKaryawan);
      });
      res.status(HttpStatus.OK).json({
        message: 'Success importing from Excel',
        status: HttpStatus.OK,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'FAILED importing from Excel',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id): Promise<Karyawan> {
    return this.karyawanService.getKaryawanById(parseInt(id));
  }
}
