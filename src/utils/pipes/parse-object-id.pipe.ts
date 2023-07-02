import { BadRequestException, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (value instanceof mongoose.Types.ObjectId) {
      return value;
    }

    try {
      return new mongoose.Types.ObjectId(value);
    } catch (e) {
      throw new BadRequestException('Invalid ID');
    }
  }
}
