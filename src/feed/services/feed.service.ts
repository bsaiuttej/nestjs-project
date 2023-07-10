import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { keyBy } from 'lodash';
import { MediaResourceService } from 'src/media-resources/services/media-resource.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { newObjectId } from 'src/utils/util-functions';
import { GetFeedDto } from '../dtos/feed-get.dto';
import {
  AddFeeContentDto,
  CreateFeedDto,
  FeedContentPostDto,
  ReorderFeedContentDto,
  UpdateFeedDto,
} from '../dtos/feed-post.dto';
import { FeedRepository } from '../repositories/feed.repository';
import { FeedContent, FeedText } from '../schema/feed.schema';

@Injectable()
export class FeedService {
  constructor(
    private readonly mediaResourceService: MediaResourceService,
    private readonly feedRepo: FeedRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createFeed(body: CreateFeedDto) {
    const logos = await this.mediaResourceService.feed.findLogos(body.logos);
    if (logos.length !== body.logos.length) {
      throw new BadRequestException('Invalid logos');
    }
    if (logos.some((logo) => !!logo.typeId)) {
      throw new BadRequestException('These logos cannot be used for this feed');
    }

    const imageKeys = body.feedBody.map((v) => v.resources).flat();
    const images = await this.mediaResourceService.feed.findImages(imageKeys);
    const imageMap = keyBy(images, (v) => v.key);
    if (images.length !== imageKeys.length) {
      throw new BadRequestException('Invalid images');
    }
    if (images.some((image) => !!image.typeId)) {
      throw new BadRequestException('These images cannot be used for this feed');
    }

    const feed = this.feedRepo.create();
    feed.title = body.title;
    feed.type = body.type;
    feed.shortDescription = body.shortDescription;
    feed.tags = body.tags;

    feed.logos = logos.map((logo) => {
      logo.typeId = feed._id;
      return logo;
    });
    await this.mediaResourceService.feed.updateFeedResources(feed.logos, [], feed.id);

    for (const value of body.feedBody) {
      const content = new FeedContent();
      content._id = newObjectId();
      content.type = value.type;
      content.text = value.text.map((v) => {
        const text = new FeedText();
        text.isLink = v.isLink;
        text.link = v.link;
        text.text = v.text;
        return text;
      });
      content.resources = value.resources.map((v) => {
        const resource = imageMap[v];
        resource.typeId = content._id;
        return resource;
      });

      await this.mediaResourceService.feed.updateFeedResources(content.resources, [], content._id);
      feed.body.push(content);
    }

    return this.feedRepo.save(feed);
  }

  async updateFeed(feedId: string, body: UpdateFeedDto) {
    const feed = await this.feedRepo.findById(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const logos = await this.mediaResourceService.feed.findLogos(body.logos, feedId);
    const logoMap = keyBy(logos, (v) => v.key);

    const currLogos = body.logos.map((v) => logoMap[v]);
    if (currLogos.length !== body.logos.length) {
      throw new BadRequestException('Invalid logos');
    }
    if (currLogos.some((logo) => !!logo.typeId)) {
      throw new BadRequestException('These logos cannot be used for this feed');
    }

    const prevLogos = logos.filter((v) => !body.logos.includes(v.key));

    feed.title = body.title;
    feed.type = body.type;
    feed.shortDescription = body.shortDescription;
    feed.tags = body.tags;

    feed.logos = currLogos.map((logo) => {
      logo.typeId = feed._id;
      return logo;
    });
    await this.mediaResourceService.feed.updateFeedResources(feed.logos, prevLogos, feed.id);

    return this.feedRepo.save(feed);
  }

  async addFeedContent(feedId: string, body: AddFeeContentDto) {
    const feed = await this.feedRepo.findById(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const images = await this.mediaResourceService.feed.findImages(body.content.resources);
    if (images.length !== body.content.resources.length) {
      throw new BadRequestException('Invalid images');
    }
    if (images.some((image) => !!image.typeId)) {
      throw new BadRequestException('These images cannot be used for this feed');
    }

    const content = new FeedContent();
    content._id = newObjectId();
    content.type = body.content.type;
    content.text = body.content.text.map((v) => {
      const text = new FeedText();
      text.isLink = v.isLink;
      text.link = v.link;
      text.text = v.text;
      return text;
    });

    content.resources = images.map((v) => {
      v.typeId = content._id;
      return v;
    });
    await this.mediaResourceService.feed.updateFeedResources(content.resources, [], content._id);

    await this.feedRepo.addContent(feedId, content, body.index);

    feed.body.splice(body.index, 0, content);
    return feed;
  }

  async updateFeedContent(feedId: string, contentId: string, body: FeedContentPostDto) {
    const feed = await this.feedRepo.findById(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const content = feed.body.find((v) => v._id.toString() === contentId);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const files = await this.mediaResourceService.feed.findImages(body.resources, contentId);
    const fileMap = keyBy(files, (v) => v.key);

    const currFiles = body.resources.map((v) => fileMap[v]);
    if (currFiles.length !== body.resources.length) {
      throw new BadRequestException('Invalid images');
    }
    if (currFiles.some((image) => !!image.typeId)) {
      throw new BadRequestException('These images cannot be used for this feed');
    }

    const prevFiles = files.filter((v) => !body.resources.includes(v.key));

    content.type = body.type;
    content.text = body.text.map((v) => {
      const text = new FeedText();
      text.isLink = v.isLink;
      text.link = v.link;
      text.text = v.text;
      return text;
    });

    content.resources = currFiles.map((v) => {
      v.typeId = content._id;
      return v;
    });

    await this.mediaResourceService.feed.updateFeedResources(
      content.resources,
      prevFiles,
      content._id,
    );
    await this.feedRepo.updateContent(feedId, contentId, content);

    return feed;
  }

  async reorderFeedContent(feedId: string, body: ReorderFeedContentDto) {
    const feed = await this.feedRepo.findById(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const contentMap = keyBy(feed.body, (v) => v._id.toString());
    const contents = body.contentIds.map((v) => contentMap[v]);
    if (contents.length !== body.contentIds.length) {
      throw new BadRequestException('Invalid content ids');
    }

    feed.body = contents;
    return this.feedRepo.save(feed);
  }

  async getFeedById(id: string) {
    const feed = await this.feedRepo.findById(id);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const users = await this.userRepo.findMetaDataByIds([feed.createdById]);
    if (users.length) {
      feed.createdBy = users[0];
    }
    return feed;
  }

  async getFeed(query: GetFeedDto) {
    const result = await this.feedRepo.findAll(query);

    const userIds = result.feed.map((v) => v.createdById);
    const users = await this.userRepo.findMetaDataByIds(userIds);
    const userMap = new Map(users.map((v) => [v.id, v]));

    result.feed.forEach((v) => {
      v.createdBy = userMap.get(v.createdById);
    });

    return result;
  }

  async deleteFeed(feedId: string) {
    const feed = await this.feedRepo.findById(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const resources = feed.logos;
    feed.body.forEach((v) => {
      resources.push(...v.resources);
    });

    await this.mediaResourceService.feed.deleteFeedResources(resources);
    await this.feedRepo.deleteById(feedId);

    return {
      success: true,
      message: 'Feed deleted successfully',
    };
  }
}
