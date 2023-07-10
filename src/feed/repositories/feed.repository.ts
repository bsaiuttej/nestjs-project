import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getObjectId } from 'src/utils/util-functions';
import { GetFeedDto } from '../dtos/feed-get.dto';
import { Feed, FeedContent } from '../schema/feed.schema';

@Injectable()
export class FeedRepository {
  constructor(@InjectModel(Feed.name) private readonly feedModel: Model<Feed>) {}

  create() {
    const feed = new this.feedModel();
    feed.body = [];
    return feed;
  }

  save(feed: Feed) {
    return feed.save();
  }

  addContent(feeId: string, content: FeedContent, index: number) {
    return this.feedModel
      .updateOne(
        { _id: getObjectId(feeId) },
        {
          $push: {
            body: {
              $each: [content],
              $position: index,
            },
          },
        },
      )
      .exec();
  }

  updateContent(feedId: string, contentId: string, content: FeedContent) {
    return this.feedModel.updateOne(
      {
        _id: getObjectId(feedId),
        body: {
          $elemMatch: { _id: getObjectId(contentId) },
        },
      },
      {
        $set: {
          'body.$': content,
        },
      },
    );
  }

  deleteById(feedId: string) {
    return this.feedModel.deleteOne({ _id: feedId }).exec();
  }

  findById(id: string) {
    return this.feedModel.findById(id).exec();
  }

  async findAll(query: GetFeedDto) {
    const result = await this.feedModel
      .aggregate([
        {
          $match: {
            ...(query.search && {
              $or: [
                { title: { $regex: query.search, $options: 'i' } },
                { shortDescription: { $regex: query.search, $options: 'i' } },
              ],
            }),
            ...(query.type && { type: query.type }),
            ...(query.tags && { tags: { $all: query.tags } }),
          },
        },
        {
          $facet: {
            count: [{ $count: 'count' }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: query.skip || 0 },
              { $limit: query.limit || 10 },
            ],
          },
        },
      ])
      .exec();

    const count = Number(result[0]?.count?.[0]?.count ?? 0);
    const data = result[0]?.data ?? [];

    return {
      count,
      feed: data as Feed[],
    };
  }
}
