import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')
    
    // Test connection by counting users
    const userCount = await prisma.user.count()
    console.log('Total users in database:', userCount)
    
    // Get all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        student: true,
        teacher: true
      }
    })
    
    console.log('\nUsers in database:')
    users.forEach(user => {
      console.log({
        id: user.id,
        email: user.email,
        role: user.role,
        hasStudent: !!user.student,
        hasTeacher: !!user.teacher
      })
    })
    
    // Test database queries
    console.log('\nTesting specific queries...')
    const studentUsers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        student: true
      }
    })
    
    console.log('\nStudent users:', studentUsers.length)
    studentUsers.forEach(user => {
      console.log({
        email: user.email,
        hasStudentProfile: !!user.student
      })
    })
    
    console.log('\nDatabase connection and schema verified successfully!')
  } catch (error) {
    console.error('Database test error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 