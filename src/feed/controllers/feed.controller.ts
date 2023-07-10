import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { GetFeedDto } from '../dtos/feed-get.dto';
import {
  AddFeeContentDto,
  CreateFeedDto,
  FeedContentPostDto,
  ReorderFeedContentDto,
  UpdateFeedDto,
} from '../dtos/feed-post.dto';
import { FeedService } from '../services/feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly service: FeedService) {}

  @Post()
  createFeed(@Body() body: CreateFeedDto) {
    return this.service.createFeed(body);
  }

  @Post(':id/add-content')
  addFeedContent(@Body() body: AddFeeContentDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.service.addFeedContent(id, body);
  }

  @Post(':id/update-content/:contentId')
  updateFeedContent(
    @Body() body: FeedContentPostDto,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('contentId', ParseObjectIdPipe) contentId: string,
  ) {
    return this.service.updateFeedContent(id, contentId, body);
  }

  @Post(':id/reorder-content')
  reorderFeedContent(
    @Body() body: ReorderFeedContentDto,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.service.reorderFeedContent(id, body);
  }

  @Put(':id')
  updateFeed(@Body() body: UpdateFeedDto, @Param('id', ParseObjectIdPipe) id: string) {
    return this.service.updateFeed(id, body);
  }

  @Get(':id')
  getFeedById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.getFeedById(id);
  }

  @Get()
  getFeed(@Query() query: GetFeedDto) {
    return this.service.getFeed(query);
  }

  @Delete(':id')
  deleteFeed(@Param('id', ParseObjectIdPipe) id: string) {
    return this.service.deleteFeed(id);
  }
}
