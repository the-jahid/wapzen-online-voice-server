import { ClerkClient, createClerkClient, type UserJSON } from "@clerk/backend";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()

export class UsersService {
    private readonly clerk:ClerkClient

    constructor (
        private readonly prisma:PrismaService,
        config: ConfigService
    ) {
        this.clerk = createClerkClient({secretKey: config.getOrThrow<string>('CLERK_SECRET_KEY')})
    }

    async findOrCreateByClerkId(clerkUserId:string) {
        const existing = await this.prisma.user.findUnique({where: {clerkId: clerkUserId}})
        if(existing) return existing

        const clerkUser = await this.clerk.users.getUser(clerkUserId)
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')

        return this.prisma.user.upsert({
            where: {clerkId: clerkUserId},
            update: {},
            create: {
                clerkId: clerkUserId,
                email: clerkUser.primaryEmailAddress?.emailAddress ?? `${clerkUserId}@no-email.local`,
                name: name || null
            }
        })
    }

    upsertFromClerk(data:UserJSON) {
        const email = data.email_addresses.find((e) => e.id === data.primary_email_address_id)?.email_address ?? `${data.id}@no-email.local`;

        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

        return this.prisma.user.upsert({
            where: {clerkId: data.id},
            update: {email, name},
            create: {clerkId: data.id, email, name}
        })
    }

    async deleteByClerkId(clerkUserId: string) {
        console.log('delete', clerkUserId)
        await this.prisma.user.deleteMany({where: {
            clerkId: clerkUserId
        }})
    }

}




