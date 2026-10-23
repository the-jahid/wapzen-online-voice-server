import { BadRequestException, Controller, HttpCode, Logger, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WebhookEvent } from '@clerk/backend';
import type { Request as ExpressRequest } from 'express';
import { Webhook } from 'svix';
import { Public } from '../auth/public.decorator';
import { UsersService } from '../users/users.service';

@Public()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly webhook: Webhook;

  constructor(
    private readonly usersService: UsersService,
    config: ConfigService,
  ) {
    this.webhook = new Webhook(config.getOrThrow<string>('CLERK_WEBHOOK_SIGNING_SECRET'));
  }

  @Post('clerk')
  @HttpCode(204)
  async handleClerk(@Req() req: RawBodyRequest<ExpressRequest>): Promise<void> {

   this.logger.verbose('am called bitch')
    const event = this.verify(req);
    console.log('event data', event.data)

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await this.usersService.upsertFromClerk(event.data);
        break;
      case 'user.deleted':
        if (event.data.id) await this.usersService.deleteByClerkId(event.data.id);
        break;
      default:
        this.logger.debug(`Ignored Clerk event: ${event.type}`);
    }
  }

  private verify(req: RawBodyRequest<ExpressRequest>): WebhookEvent {
    const payload = req.rawBody?.toString('utf8');
    if (!payload) {
      throw new BadRequestException('Missing raw body');
    }

    try {
      // svix v2 verify() returns nothing and throws on a bad signature
      this.webhook.verify(payload, {
        'svix-id': req.header('svix-id') ?? '',
        'svix-timestamp': req.header('svix-timestamp') ?? '',
        'svix-signature': req.header('svix-signature') ?? '',
      });
    } catch (err) {
      this.logger.warn(`Clerk webhook verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    return JSON.parse(payload) as WebhookEvent;
  }
}
