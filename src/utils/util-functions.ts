import { UnprocessableEntityException } from '@nestjs/common';
import mongoose from 'mongoose';

export function isValuesEqual(id1: any, id2: any, absolute = false) {
  if (id1 instanceof mongoose.Types.ObjectId) {
    return id1.equals(id2);
  }
  if (id2 instanceof mongoose.Types.ObjectId) {
    return id2.equals(id1);
  }

  if (absolute) return id1 === id2;

  return id1 == id2;
}

export function getObjectId(id: any) {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  try {
    return new mongoose.Types.ObjectId(id);
  } catch (e) {
    throw new UnprocessableEntityException('Invalid ID');
  }
}
