import { db } from '../src/lib/db'

async function main() {
  try {
    const user = await db.user.findFirst({
      where: {
        email: 'shubham.sikarwar2005@gmail.com'
      }
    })

    if (!user) {
      console.error('User not found')
      return
    }

    const student = await db.student.create({
      data: {
        userId: user.id
      }
    })

    console.log('Created student profile:', student)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

main() 