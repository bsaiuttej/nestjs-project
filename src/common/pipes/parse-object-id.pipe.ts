import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (value instanceof mongoose.Types.ObjectId) {
      return value.toString();
    }

    try {
      return new mongoose.Types.ObjectId(value).toString();
    } catch (e) {
      throw new BadRequestException('Invalid ID');
    }
  }
}
