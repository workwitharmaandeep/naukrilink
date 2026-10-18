import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { QuestionStatus, QuizAttemptStatus, SkillLevel } from '@prisma/client';

export interface QuizSubmissionInput {
  answers: Array<{
    questionId: string;
    selectedOptionIndex: number;
    timeSpentSeconds: number;
  }>;
}

export class QuizService {
  private getStudentProfile = async (userId: string) => {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found. Complete student profile setup first.');
    }
    return student;
  };

  /**
   * List all skills with question counts, current verified badge status, and retake eligibility.
   */
  async getAvailableQuizzes(userId: string) {
    const student = await this.getStudentProfile(userId);

    // Get skills that have approved quiz questions
    const skillsWithQuestions = await prisma.skill.findMany({
      where: {
        quizQuestions: {
          some: { status: QuestionStatus.APPROVED },
        },
      },
      include: {
        _count: {
          select: {
            quizQuestions: {
              where: { status: QuestionStatus.APPROVED },
            },
          },
        },
        studentSkills: {
          where: { studentProfileId: student.id },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get recent attempts to calculate retake cooldown (24 hour policy)
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: {
        studentProfileId: student.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

    const result = skillsWithQuestions.map((skill) => {
      const studentSkill = skill.studentSkills[0];
      const verifiedScore = studentSkill?.verifiedScore ?? null;

      // Determine badge tier
      let badgeTier: 'GOLD' | 'SILVER' | 'BRONZE' | null = null;
      if (verifiedScore !== null) {
        if (verifiedScore >= 90) badgeTier = 'GOLD';
        else if (verifiedScore >= 80) badgeTier = 'SILVER';
        else if (verifiedScore >= 70) badgeTier = 'BRONZE';
      }

      // Find latest attempt for this skill
      const lastAttempt = recentAttempts.find((a) => a.skillId === skill.id);
      let canRetake = true;
      let nextRetakeAvailableAt: Date | null = null;

      if (lastAttempt && lastAttempt.completedAt) {
        const elapsed = now - new Date(lastAttempt.completedAt).getTime();
        if (elapsed < COOLDOWN_MS) {
          canRetake = false;
          nextRetakeAvailableAt = new Date(new Date(lastAttempt.completedAt).getTime() + COOLDOWN_MS);
        }
      }

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        totalQuestionsAvailable: skill._count.quizQuestions,
        verifiedScore,
        badgeTier,
        lastAssessedAt: studentSkill?.lastAssessedAt ?? null,
        canRetake,
        nextRetakeAvailableAt,
        timeLimitMinutes: 15,
      };
    });

    return result;
  }

  /**
   * Start a new timed quiz attempt for a skill.
   */
  async startQuizAttempt(userId: string, skillId: string) {
    const student = await this.getStudentProfile(userId);

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });
    if (!skill) throw new AppError(404, 'SKILL_NOT_FOUND', 'Skill not found');

    // Check cooldown
    const latestAttempt = await prisma.quizAttempt.findFirst({
      where: {
        studentProfileId: student.id,
        skillId,
        status: QuizAttemptStatus.COMPLETED,
      },
      orderBy: { completedAt: 'desc' },
    });

    const COOLDOWN_MS = 24 * 60 * 60 * 1000;
    if (latestAttempt && latestAttempt.completedAt) {
      const elapsed = Date.now() - new Date(latestAttempt.completedAt).getTime();
      if (elapsed < COOLDOWN_MS) {
        const waitHours = Math.ceil((COOLDOWN_MS - elapsed) / (1000 * 60 * 60));
        throw new AppError(
          429,
          'COOLDOWN_ACTIVE',
          `Skill assessment cooldown active. You can retake the ${skill.name} assessment in ${waitHours} hour(s).`
        );
      }
    }

    // Retrieve approved questions for this skill
    const questions = await prisma.quizQuestion.findMany({
      where: {
        skillId,
        status: QuestionStatus.APPROVED,
      },
    });

    if (questions.length < 5) {
      throw new AppError(
        400,
        'INSUFFICIENT_QUESTIONS',
        `Not enough verified questions available for ${skill.name} to conduct a standardized quiz.`
      );
    }

    // Shuffle and pick up to 10 questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 10);

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentProfileId: student.id,
        skillId,
        totalQuestions: selectedQuestions.length,
        correctCount: 0,
        scorePercentage: 0,
        assessedLevel: SkillLevel.BEGINNER,
        timeSpentSeconds: 0,
        status: QuizAttemptStatus.IN_PROGRESS,
      },
    });

    // Strip sensitive fields (correctAnswerIndex and explanation) before returning to client
    const sanitizedQuestions = selectedQuestions.map((q, index) => ({
      index: index + 1,
      id: q.id,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options as string[],
      difficulty: q.difficulty,
    }));

    return {
      attemptId: attempt.id,
      skillName: skill.name,
      skillCategory: skill.category,
      totalQuestions: selectedQuestions.length,
      timeLimitMinutes: 15,
      durationSeconds: 900,
      startedAt: attempt.startedAt,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Submit quiz answers, compute verified score, award badges, and return review report.
   */
  async submitQuizAttempt(userId: string, attemptId: string, input: QuizSubmissionInput) {
    const student = await this.getStudentProfile(userId);

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        studentProfile: true,
      },
    });

    if (!attempt || attempt.studentProfileId !== student.id) {
      throw new AppError(404, 'ATTEMPT_NOT_FOUND', 'Quiz attempt session not found');
    }

    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
      throw new AppError(400, 'ALREADY_SUBMITTED', 'This quiz attempt has already been submitted or completed');
    }

    // Check time limit: 15 mins (900s) + 60s network grace period
    const started = new Date(attempt.startedAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
    const isTimedOut = elapsedSeconds > 960;

    // Fetch the questions submitted
    const questionIds = input.answers.map((a) => a.questionId);
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
    });
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    const answerReviews: any[] = [];
    const totalQuestions = attempt.totalQuestions;

    for (const ans of input.answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isCorrect = !isTimedOut && ans.selectedOptionIndex === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      answerReviews.push({
        questionId: q.id,
        questionText: q.questionText,
        codeSnippet: q.codeSnippet,
        options: q.options as string[],
        selectedOptionIndex: ans.selectedOptionIndex,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation,
        difficulty: q.difficulty,
      });
    }

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Compute assessed level
    let assessedLevel: SkillLevel = SkillLevel.BEGINNER;
    if (scorePercentage >= 85) assessedLevel = SkillLevel.ADVANCED;
    else if (scorePercentage >= 70) assessedLevel = SkillLevel.INTERMEDIATE;

    // Determine badge tier
    let badgeTier: 'GOLD' | 'SILVER' | 'BRONZE' | null = null;
    if (scorePercentage >= 90) badgeTier = 'GOLD';
    else if (scorePercentage >= 80) badgeTier = 'SILVER';
    else if (scorePercentage >= 70) badgeTier = 'BRONZE';

    const finalStatus = isTimedOut ? QuizAttemptStatus.TIMED_OUT : QuizAttemptStatus.COMPLETED;

    // Transaction to update attempt, save individual answers, and award badge in StudentSkill
    const updatedAttempt = await prisma.$transaction(async (tx) => {
      // 1. Save all individual answers
      for (const ans of input.answers) {
        const q = questionMap.get(ans.questionId);
        if (!q) continue;

        await tx.quizAnswer.create({
          data: {
            quizAttemptId: attempt.id,
            questionId: ans.questionId,
            selectedOptionIndex: ans.selectedOptionIndex,
            isCorrect: ans.selectedOptionIndex === q.correctAnswerIndex,
            timeSpentSeconds: ans.timeSpentSeconds || 0,
          },
        });
      }

      // 2. Update Quiz Attempt record
      const finished = await tx.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          status: finalStatus,
          correctCount,
          scorePercentage,
          assessedLevel,
          timeSpentSeconds: elapsedSeconds,
          completedAt: new Date(),
        },
      });

      // 3. Update or Upsert StudentSkill verification if passed (>= 70%) or update last assessed
      const existingStudentSkill = await tx.studentSkill.findUnique({
        where: {
          studentProfileId_skillId: {
            studentProfileId: student.id,
            skillId: attempt.skillId,
          },
        },
      });

      if (existingStudentSkill) {
        // Keep highest verified score
        const newScore =
          existingStudentSkill.verifiedScore !== null
            ? Math.max(existingStudentSkill.verifiedScore, scorePercentage)
            : scorePercentage;

        await tx.studentSkill.update({
          where: { id: existingStudentSkill.id },
          data: {
            verifiedScore: newScore,
            declaredLevel: assessedLevel,
            lastAssessedAt: new Date(),
          },
        });
      } else {
        await tx.studentSkill.create({
          data: {
            studentProfileId: student.id,
            skillId: attempt.skillId,
            declaredLevel: assessedLevel,
            verifiedScore: scorePercentage,
            lastAssessedAt: new Date(),
          },
        });
      }

      return finished;
    });

    const skill = await prisma.skill.findUnique({ where: { id: attempt.skillId } });

    return {
      attemptId: updatedAttempt.id,
      skillName: skill?.name,
      totalQuestions,
      correctCount,
      scorePercentage,
      assessedLevel,
      badgeTier,
      isPassed: scorePercentage >= 70,
      timeSpentSeconds: elapsedSeconds,
      isTimedOut,
      answerReviews,
    };
  }

  /**
   * Get student's past quiz history.
   */
  async getStudentQuizHistory(userId: string) {
    const student = await this.getStudentProfile(userId);

    const attempts = await prisma.quizAttempt.findMany({
      where: { studentProfileId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        answers: true,
      },
    });

    // Populate skill names
    const skillIds = [...new Set(attempts.map((a) => a.skillId))];
    const skills = await prisma.skill.findMany({ where: { id: { in: skillIds } } });
    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

    return attempts.map((a) => ({
      id: a.id,
      skillId: a.skillId,
      skillName: skillMap.get(a.skillId) || 'Unknown Skill',
      totalQuestions: a.totalQuestions,
      correctCount: a.correctCount,
      scorePercentage: a.scorePercentage,
      assessedLevel: a.assessedLevel,
      status: a.status,
      timeSpentSeconds: a.timeSpentSeconds,
      completedAt: a.completedAt,
    }));
  }
}

export const quizService = new QuizService();
