import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    UsersModule,
    WebhooksModule
  ],
  controllers: [AppController],
  providers: [AppService, {provide: APP_GUARD, useClass: ClerkAuthGuard}],
})
export class AppModule {}
