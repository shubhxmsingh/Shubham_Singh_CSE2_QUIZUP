const { PrismaClient } = require('@prisma/client');
const { UserRole } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const firstName = process.argv[3] || 'Admin';
  const lastName = process.argv[4] || 'User';
  const clerkId = process.argv[5] || 'admin_default_id';
  
  if (!email) {
    console.error('Email is required. Usage: node scripts/create-admin-updated.js email [firstName] [lastName] [clerkId]');
    process.exit(1);
  }
  
  try {
    // Log available roles
    console.log('Available roles:', UserRole);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          role: UserRole.ADMIN,
          firstName,
          lastName,
          clerkId,
          isActive: true,
          emailVerified: true
        },
      });
      console.log('User updated to admin:', updatedUser);
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role: UserRole.ADMIN,
          clerkId,
          isActive: true,
          emailVerified: true
        }
      });
      console.log('New admin user created:', newUser);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 