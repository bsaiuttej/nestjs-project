import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';
import { Model } from 'mongoose';
import { getObjectId } from 'src/utils/util-functions';
import { MediaResource } from '../schemas/media-resource.schema';

interface UploadToBucketProps {
  file: Express.Multer.File;
  type: string;
  subtype?: string;
  key: string;
  typeId?: string;
}

export interface FindOneProps {
  type?: string;
  subtype?: string;
  typeId?: string;
  key?: string;
  notKey?: string;
}

export class FindManyProps {
  type?: string;
  subtype?: string;
  typeId?: string;
  typeIds?: string[];
  keys?: string[];
  notKeys?: string[];
  orKeysIds?: {
    keys: string[];
    typeIds: string[];
  };
}

@Injectable()
export class MediaResourceManager {
  private readonly s3: AWS.S3;
  private readonly s3BucketName: string;

  constructor(
    @InjectModel(MediaResource.name) private readonly mediaResourceModel: Model<MediaResource>,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION,
    });

    this.s3BucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadToS3bucket(props: UploadToBucketProps) {
    const data = await this.s3
      .upload({
        Bucket: this.s3BucketName,
        Body: Buffer.from(props.file.buffer),
        Key: props.key,
        ContentType: props.file.mimetype,
      })
      .promise()
      .catch((err) => {
        console.log(err);
        throw new UnprocessableEntityException(err.message);
      });

    const resource = new this.mediaResourceModel();
    resource.key = data.Key;
    resource.originalFileName = props.file.originalname;
    resource.type = props.type;
    resource.subtype = props.subtype;
    resource.typeId = props.typeId;
    resource.s3Response = data;
    resource.fileSize = props.file.size;
    resource.mimeType = props.file.mimetype;
    resource.mediaType = this.getMediaType(props.file.mimetype);
    resource.createdAt = new Date();
    resource.updatedAt = new Date();
    await resource.save();

    return this.findOne({ key: resource.key });
  }

  private getMediaType(mimeType: string) {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType == 'application/pdf') {
      return 'pdf';
    }
    return 'unknown';
  }

  updateTypeId(key: string[], typeId: string) {
    return this.mediaResourceModel.updateMany(
      { key: { $in: key } },
      { typeId: getObjectId(typeId) },
    );
  }

  async findOne(props: FindOneProps) {
    return this.mediaResourceModel
      .findOne({
        $and: [
          ...(props.type ? [{ type: props.type }] : []),
          ...(props.subtype ? [{ subtype: props.subtype }] : []),
          ...(props.typeId ? [{ typeId: getObjectId(props.typeId) }] : []),
          ...(props.key ? [{ key: props.key }] : []),
          ...(props.notKey ? [{ key: { $ne: props.notKey } }] : []),
        ],
      })
      .exec();
  }

  async findMany(props: FindManyProps) {
    return this.mediaResourceModel
      .find({
        $and: [
          ...(props.type ? [{ type: props.type }] : []),
          ...(props.subtype ? [{ subtype: props.subtype }] : []),
          ...(props.typeId ? [{ typeId: getObjectId(props.typeId) }] : []),
          ...(props.typeIds ? [{ typeId: { $in: props.typeIds.map(getObjectId) } }] : []),
          ...(props.keys ? [{ key: { $in: props.keys } }] : []),
          ...(props.notKeys ? [{ key: { $nin: props.notKeys } }] : []),
          ...(props.orKeysIds
            ? [
                {
                  $or: [
                    ...(props.orKeysIds.keys ? [{ key: { $in: props.orKeysIds.keys } }] : []),
                    ...(props.orKeysIds.typeIds
                      ? [{ typeId: { $in: props.orKeysIds.typeIds.map(getObjectId) } }]
                      : []),
                  ],
                },
              ]
            : []),
        ],
      })
      .exec();
  }

  async deleteMany(resources: MediaResource[]) {
    if (!resources.length) return;
    await this.mediaResourceModel.deleteMany({ _id: { $in: resources.map((r) => r._id) } });
    await this.deleteFiles(resources.map((r) => r.key));
  }

  async deleteOne(resource: MediaResource) {
    return this.deleteMany([resource]);
  }

  private async deleteFiles(keys: string[]) {
    if (!keys.length) return;
    return new Promise((resolve, reject) => {
      this.s3.deleteObjects(
        {
          Bucket: this.s3BucketName,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        },
      );
    });
  }
}
