import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const eventType = evt.type;
  console.log('Webhook event type:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0].email_address;
    console.log('Processing user:', { id, email, first_name, last_name });

    try {
      // First, check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
        include: {
          student: true
        }
      });

      console.log('Existing user:', existingUser);

      if (existingUser) {
        console.log('Updating existing user');
        // Update existing user and ensure student record exists
        const updatedUser = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email,
            firstName: first_name || '',
            lastName: last_name || '',
            role: 'STUDENT'
          },
          include: {
            student: true
          }
        });

        console.log('Updated user:', updatedUser);

        // Create student record if it doesn't exist
        if (!updatedUser.student) {
          console.log('Creating student record for existing user');
          await prisma.student.create({
            data: { userId: updatedUser.id }
          });
        }
      } else {
        console.log('Creating new user');
        // Create new user with student record
        const newUser = await prisma.user.create({
          data: {
            clerkId: id,
            email: email,
            firstName: first_name || '',
            lastName: last_name || '',
            role: 'STUDENT',
            student: {
              create: {}
            }
          },
          include: {
            student: true
          }
        });

        console.log('Created new user:', newUser);
      }

      return new Response('User synchronized', { status: 200 });
    } catch (error) {
      console.error('Error syncing user:', error);
      return new Response('Error syncing user', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
} 