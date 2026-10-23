import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { WebhooksController } from "./webhooks.controller";


@Module({
  imports: [UsersModule],
  controllers: [WebhooksController]
})

export class WebhooksModule {}









