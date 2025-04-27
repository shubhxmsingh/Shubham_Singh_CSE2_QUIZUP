import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    console.log("Auth userId (Clerk ID):", userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find the user by Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    console.log("Database user:", user ? `Found - ID: ${user.id}, Role: ${user.role}` : "Not found");

    if (!user) {
      // Return empty data if user not found
      return NextResponse.json({ 
        message: 'User not found or not linked to database',
        quizzes: [] 
      });
    }

    // Get assigned quizzes from the database
    console.log(`Looking for quiz assignments for student ID: ${user.id}`);
    
    const quizAssignments = await db.quizAssignment.findMany({
      where: { studentId: user.id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            duration: true,
            level: true
          }
        }
      }
    });

    console.log(`Found ${quizAssignments.length} quiz assignments for user ${user.id}`);
    
    if (quizAssignments.length === 0) {
      // Check if there are any quizzes in the database
      const totalQuizzes = await db.quiz.count();
      const totalAssignments = await db.quizAssignment.count();
      console.log(`Total quizzes in database: ${totalQuizzes}`);
      console.log(`Total assignments in database: ${totalAssignments}`);
      
      // List all assignments to debug
      if (totalAssignments > 0) {
        try {
          console.log("Attempting to fetch all quiz assignments...");
          const allAssignments = await db.quizAssignment.findMany({
            include: { 
              student: { select: { id: true, email: true } },
              quiz: { select: { id: true, title: true } }
            }
          });
          
          console.log("All quiz assignments in system:");
          allAssignments.forEach(assignment => {
            console.log(`Quiz "${assignment.quiz.title}" (${assignment.quizId}) assigned to student ${assignment.student.email} (${assignment.studentId})`);
          });
        } catch (err) {
          console.error("Error fetching all assignments:", err);
        }
      }
    }
    
    // Get all quiz results for this user to determine which quizzes are completed
    const quizResults = await db.quizResult.findMany({
      where: { userId: user.id },
      select: {
        quizId: true,
        score: true,
      }
    });

    console.log(`Found ${quizResults.length} quiz results for user ${user.id}`);
    
    // Create a map for quick lookup of quiz results
    const resultsMap = new Map(
      quizResults.map(result => [result.quizId, result])
    );

    // Format the data for the frontend
    const formattedQuizzes = quizAssignments.map(assignment => {
      const quizResult = resultsMap.get(assignment.quiz.id);
      const isCompleted = !!quizResult;
      
      console.log(`Quiz ${assignment.quiz.id}: status=${isCompleted ? 'Completed' : 'Assigned'}, score=${quizResult?.score || 'none'}`);
      
      return {
        id: assignment.quiz.id,
        title: assignment.quiz.title,
        subject: assignment.quiz.subject,
        status: isCompleted ? 'Completed' : 'Assigned', // Set status based on whether there's a result
        assignedDate: assignment.createdAt?.toISOString(),
        timeLimit: assignment.quiz.duration,
        score: isCompleted ? quizResult.score : null, // Include score if completed
      };
    });

    console.log(`Returning ${formattedQuizzes.length} formatted quizzes`);
    
    return NextResponse.json({ quizzes: formattedQuizzes });
  } catch (error) {
    console.error('Error fetching assigned quizzes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assigned quizzes',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 