import { Injectable } from '@nestjs/common';
import { FeedResource } from '../resources/feed.resource';
import { MediaResourceManager } from './media-resource-manager';

@Injectable()
export class MediaResourceService {
  public readonly feed: FeedResource;

  constructor(mediaManager: MediaResourceManager) {
    this.feed = new FeedResource(mediaManager);
  }
}
