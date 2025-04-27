const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Connection successful!', result);
    return { success: true };
  } catch (error) {
    console.error('Connection failed:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().then(result => {
  console.log('Test completed:', result);
  process.exit(result.success ? 0 : 1);
}); 