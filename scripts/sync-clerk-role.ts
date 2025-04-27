import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all users from database
    const dbUsers = await prisma.user.findMany();
    
    console.log(`Found ${dbUsers.length} users in database`);

    for (const user of dbUsers) {
      console.log(`Syncing role for user ${user.email}`);
      
      try {
        // Update Clerk user metadata
        await clerkClient.users.updateUser(user.clerkId, {
          publicMetadata: {
            role: user.role
          }
        });
        console.log(`Updated Clerk metadata for ${user.email} with role ${user.role}`);
      } catch (error) {
        console.error(`Error updating Clerk metadata for ${user.email}:`, error);
      }
    }

    console.log('Done syncing roles');
  } catch (error) {
    console.error('Error syncing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 