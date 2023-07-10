import { BadRequestException } from '@nestjs/common';
import { v4 } from 'uuid';
import { MediaResource } from '../schemas/media-resource.schema';
import { MediaResourceManager } from '../services/media-resource-manager';

const type = 'feed';
enum subTypes {
  LOGOS = 'logos',
  IMAGES = 'images',
}

export class FeedResource {
  constructor(private readonly manager: MediaResourceManager) {}

  async uploadFeedLogo(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const extension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}--${v4()}.${extension}`;

    return this.manager.uploadToS3bucket({
      file: file,
      type: type,
      subtype: subTypes.LOGOS,
      key: `${type}/${subTypes.LOGOS}/${fileName}`,
    });
  }

  async uploadFeedImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const extension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}--${v4()}.${extension}`;

    return this.manager.uploadToS3bucket({
      file: file,
      type: type,
      subtype: subTypes.IMAGES,
      key: `${type}/${subTypes.IMAGES}/${fileName}`,
    });
  }

  async findLogos(keys: string[], typeId?: string) {
    if (!keys.length && !typeId) return [];

    return this.manager.findMany({
      type: type,
      subtype: subTypes.LOGOS,
      orKeysIds: {
        keys: keys,
        typeIds: typeId ? [typeId] : [],
      },
    });
  }

  async findImages(keys: string[], typeId?: string) {
    if (!keys.length && !typeId) return [];

    return this.manager.findMany({
      type: type,
      subtype: subTypes.IMAGES,
      orKeysIds: {
        keys: keys,
        typeIds: typeId ? [typeId] : [],
      },
    });
  }

  async updateFeedResources(add: MediaResource[], removed: MediaResource[], typeId: string) {
    await this.manager.updateTypeId(
      add.map((v) => v.key),
      typeId,
    );

    await this.manager.deleteMany(removed);
  }

  async deleteFeedResources(files: MediaResource[]) {
    await this.manager.deleteMany(files);
  }
}
