import { Injectable } from '@nestjs/common';
import { MediaResourceManager } from './media-resource-manager';

@Injectable()
export class MediaResourceService {
  constructor(private readonly mediaManager: MediaResourceManager) {}
}
