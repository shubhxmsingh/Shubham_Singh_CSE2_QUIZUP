import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log('Processing webhook event:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error('No email found for user:', id);
      return new Response('Error: No email found', { status: 400 });
    }

    try {
      // Use a transaction for atomic operations
      await prisma.$transaction(async (tx) => {
        // Check if user exists
        const existingUser = await tx.user.findUnique({
          where: { clerkId: id },
          include: {
            student: true,
            teacher: true
          }
        });

        if (existingUser) {
          console.log('Updating existing user:', existingUser.id);
          // Update user
          await tx.user.update({
            where: { clerkId: id },
            data: {
              email,
              firstName: first_name || '',
              lastName: last_name || '',
              emailVerified: true,
              lastLoginAt: new Date()
            }
          });
        } else {
          console.log('Creating new user with student role');
          // Create new user with student role and record
          const newUser = await tx.user.create({
            data: {
              clerkId: id,
              email,
              firstName: first_name || '',
              lastName: last_name || '',
              role: 'STUDENT',
              emailVerified: true,
              lastLoginAt: new Date(),
              student: {
                create: {} // Create associated student record
              }
            },
            include: {
              student: true
            }
          });
          console.log('Created new user:', newUser.id);
        }
      });

      return new Response('User synchronized successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing user webhook:', error);
      return new Response('Error processing user', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
} 