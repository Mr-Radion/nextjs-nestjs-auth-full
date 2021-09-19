import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Injectable()
export class FileService {
  createFileLocal(type: FileType, file: any): string {
    try {
      console.log(type, 15);
      console.log(file, 16);
      console.log(file.originalname, 17);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = uuidv4() + '.' + fileExtension;
      const filePath = path.resolve(__dirname, '..', '..', '..', 'static', type);
      // const filePath = path.resolve(__dirname, '..', '..', 'static', type);
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.resolve(filePath, fileName), file.buffer);
      return type + '/' + fileName;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
