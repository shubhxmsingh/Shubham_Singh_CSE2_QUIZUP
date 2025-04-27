-- AlterTable
ALTER TABLE "_AssignedQuizzes" ADD CONSTRAINT "_AssignedQuizzes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AssignedQuizzes_AB_unique";

-- AlterTable
ALTER TABLE "_CourseToStudent" ADD CONSTRAINT "_CourseToStudent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CourseToStudent_AB_unique";
