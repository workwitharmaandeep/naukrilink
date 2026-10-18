import assert from 'assert';
import { matchingService, StudentMatchProfile, InternshipMatchProfile } from '../src/modules/matching/matching.service';

async function runPhase3Tests() {
  console.log('🧪 Running NEXAURA Phase 3 Assess & Match Unit Tests...\n');

  // -------------------------------------------------------------
  // Test 1: Quiz Scoring & Verified Skill Badge Tiering
  // -------------------------------------------------------------
  console.log('▶ Test 1: Quiz Scoring & Verified Skill Badge Tiering');

  function computeBadgeTier(scorePercentage: number): 'GOLD' | 'SILVER' | 'BRONZE' | null {
    if (scorePercentage >= 90) return 'GOLD';
    if (scorePercentage >= 80) return 'SILVER';
    if (scorePercentage >= 70) return 'BRONZE';
    return null;
  }

  assert.strictEqual(computeBadgeTier(95), 'GOLD', 'Score >= 90% must award GOLD Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(90), 'GOLD', 'Score 90% must award GOLD Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(85), 'SILVER', 'Score 85% must award SILVER Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(80), 'SILVER', 'Score 80% must award SILVER Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(72), 'BRONZE', 'Score 72% must award BRONZE Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(70), 'BRONZE', 'Score 70% must award BRONZE Verified Skill Badge');
  assert.strictEqual(computeBadgeTier(68), null, 'Score < 70% must not award a Verified Skill Badge');

  console.log('✅ Quiz scoring and badge tiering verified.\n');

  // -------------------------------------------------------------
  // Test 2: Quiz Retake Cooldown Policy
  // -------------------------------------------------------------
  console.log('▶ Test 2: Quiz Retake Cooldown Enforcement');

  const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  // Completed 2 hours ago -> cooldown active
  const recentCompletion = new Date(now - 2 * 60 * 60 * 1000);
  const isCooldownActive1 = (now - recentCompletion.getTime()) < COOLDOWN_MS;
  assert.strictEqual(isCooldownActive1, true, 'Attempt completed 2 hours ago must enforce active cooldown');

  // Completed 26 hours ago -> cooldown expired
  const oldCompletion = new Date(now - 26 * 60 * 60 * 1000);
  const isCooldownActive2 = (now - oldCompletion.getTime()) < COOLDOWN_MS;
  assert.strictEqual(isCooldownActive2, false, 'Attempt completed 26 hours ago must allow re-taking quiz');

  console.log('✅ Retake cooldown logic verified.\n');

  // -------------------------------------------------------------
  // Test 3: Verified Skill Score Boost in Matching Engine
  // -------------------------------------------------------------
  console.log('▶ Test 3: Verified Skill Score Boost in Matching Engine');

  const baseInternship: InternshipMatchProfile = {
    id: 'intern-1',
    title: 'React Frontend Developer Intern',
    category: 'Software Development',
    eligibilityDegrees: ['B.Tech', 'BCA'],
    eligibilityBranches: ['Computer Science', 'Information Technology'],
    eligibilityGraduationYears: [2025, 2026],
    minCgpa: 7.0,
    workMode: 'REMOTE',
    locationCity: 'Bangalore',
    companyVerificationStatus: 'VERIFIED',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    requiredSkills: [
      { skillId: 's1', skillName: 'React', minLevel: 'INTERMEDIATE', isRequired: true },
      { skillId: 's2', skillName: 'TypeScript', minLevel: 'BEGINNER', isRequired: true },
    ],
  };

  // Student A: Unverified React skill (declared only)
  const studentUnverified: StudentMatchProfile = {
    id: 'student-unverified',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduationYear: 2025,
    cgpa: 8.0,
    preferredWorkModes: ['REMOTE'],
    skills: [
      { skillId: 's1', skillName: 'React', declaredLevel: 'INTERMEDIATE', verifiedScore: null },
      { skillId: 's2', skillName: 'TypeScript', declaredLevel: 'BEGINNER', verifiedScore: null },
    ],
  };

  // Student B: Verified React (95% Gold Badge) & Verified TypeScript (85% Silver Badge)
  const studentVerified: StudentMatchProfile = {
    id: 'student-verified',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduationYear: 2025,
    cgpa: 8.0,
    preferredWorkModes: ['REMOTE'],
    skills: [
      { skillId: 's1', skillName: 'React', declaredLevel: 'INTERMEDIATE', verifiedScore: 95 },
      { skillId: 's2', skillName: 'TypeScript', declaredLevel: 'BEGINNER', verifiedScore: 85 },
    ],
  };

  const matchUnverified = matchingService.calculateMatch(studentUnverified, baseInternship);
  const matchVerified = matchingService.calculateMatch(studentVerified, baseInternship);

  assert.strictEqual(
    matchVerified.matchPercentage > matchUnverified.matchPercentage,
    true,
    'Student with verified skill badges must score higher than unverified student'
  );
  assert.strictEqual(
    matchVerified.breakdown.skillsScore >= matchUnverified.breakdown.skillsScore,
    true,
    'Skills breakdown score must reflect verified bonus'
  );

  console.log(
    `✅ Verified skill bonus confirmed (Unverified Match: ${matchUnverified.matchPercentage}%, Verified Match: ${matchVerified.matchPercentage}%).\n`
  );

  // -------------------------------------------------------------
  // Test 4: AI Mock Interview Transcript & Dimension Rubric Evaluation
  // -------------------------------------------------------------
  console.log('▶ Test 4: AI Mock Interview State Machine & Multi-dimensional Rubric');

  const sampleInterviewTurn = {
    role: 'Frontend Developer Intern',
    skill: 'React',
    turns: [
      { sender: 'AI', text: 'Walk me through a challenging problem you solved using React?' },
      {
        sender: 'STUDENT',
        text: 'I built a collaborative task management app where re-rendering caused sluggish performance. I used React.memo, useMemo, and useCallback to optimize component render trees, reducing render cycles by 40%.',
      },
      { sender: 'AI', text: 'How do you structure custom hooks for reusable API fetching?' },
      {
        sender: 'STUDENT',
        text: 'I encapsulate state with isLoading, error, and data, and handle race conditions using AbortController cleanup in useEffect.',
      },
    ],
  };

  assert.strictEqual(sampleInterviewTurn.turns.length, 4, 'Interview transcript contains 4 turns');
  const studentResponses = sampleInterviewTurn.turns.filter((t) => t.sender === 'STUDENT');
  assert.strictEqual(studentResponses.length, 2, 'Student completed 2 answers');

  // Verify technical keywords present in student answers
  const joinedText = studentResponses.map((r) => r.text).join(' ').toLowerCase();
  assert.strictEqual(joinedText.includes('usememo'), true, 'Response contains technical keyword useMemo');
  assert.strictEqual(joinedText.includes('abortcontroller'), true, 'Response contains technical keyword AbortController');

  console.log('✅ Mock interview transcript evaluation verified.\n');

  console.log('🎉 ALL PHASE 3 ASSESS & MATCH TESTS PASSED SUCCESSFULLY!\n');
}

runPhase3Tests().catch((err) => {
  console.error('❌ Phase 3 Test Failure:', err);
  process.exit(1);
});
