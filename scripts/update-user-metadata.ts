import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get your user from database (using your email)
    const dbUser = await prisma.user.findUnique({
      where: {
        email: 'shubham.sikarwar2005@gmail.com'
      }
    });

    if (!dbUser) {
      console.error('User not found in database');
      return;
    }

    console.log('Found user:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role
    });

    // Update Clerk user metadata
    try {
      const updatedUser = await clerkClient.users.updateUser(dbUser.clerkId, {
        publicMetadata: {
          role: dbUser.role
        }
      });

      console.log('Updated Clerk metadata:', {
        id: updatedUser.id,
        email: updatedUser.emailAddresses[0]?.emailAddress,
        metadata: updatedUser.publicMetadata
      });
    } catch (error) {
      console.error('Error updating Clerk metadata:', error);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 