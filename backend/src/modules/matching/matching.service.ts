export interface MatchingWeights {
  skillsWeight: number; // default 0.45
  preferencesWeight: number; // default 0.25
  locationWeight: number; // default 0.15
  verificationWeight: number; // default 0.15
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  skillsWeight: 0.45,
  preferencesWeight: 0.25,
  locationWeight: 0.15,
  verificationWeight: 0.15,
};

export interface StudentMatchProfile {
  id: string;
  degree?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  locationCity?: string | null;
  locationState?: string | null;
  preferredWorkModes?: string[];
  skills: Array<{
    skillId: string;
    skillName: string;
    declaredLevel: string;
    verifiedScore?: number | null;
  }>;
}

export interface InternshipMatchProfile {
  id: string;
  title: string;
  category: string;
  eligibilityDegrees: string[];
  eligibilityBranches: string[];
  eligibilityGraduationYears: number[];
  minCgpa?: number | null;
  workMode: string;
  locationCity?: string | null;
  locationState?: string | null;
  companyVerificationStatus: string;
  deadline: Date;
  requiredSkills: Array<{
    skillId: string;
    skillName: string;
    minLevel: string;
    isRequired: boolean;
  }>;
}

export interface MatchResult {
  isEligible: boolean;
  ineligibilityReasons: string[];
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanationText: string;
  breakdown: {
    skillsScore: number;
    preferencesScore: number;
    locationScore: number;
    verificationScore: number;
  };
}

export interface IMatchingService {
  calculateMatch(
    student: StudentMatchProfile,
    internship: InternshipMatchProfile,
    weights?: MatchingWeights
  ): MatchResult;
}

export class RuleBasedMatchingService implements IMatchingService {
  calculateMatch(
    student: StudentMatchProfile,
    internship: InternshipMatchProfile,
    weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
  ): MatchResult {
    const ineligibilityReasons: string[] = [];

    // 1. Hard Eligibility Filters
    if (new Date() > new Date(internship.deadline)) {
      ineligibilityReasons.push('Application deadline has passed');
    }

    if (
      internship.minCgpa &&
      student.cgpa !== null &&
      student.cgpa !== undefined &&
      student.cgpa < internship.minCgpa
    ) {
      ineligibilityReasons.push(`CGPA (${student.cgpa}) is below required minimum (${internship.minCgpa})`);
    }

    if (
      internship.eligibilityGraduationYears.length > 0 &&
      student.graduationYear &&
      !internship.eligibilityGraduationYears.includes(student.graduationYear)
    ) {
      ineligibilityReasons.push(
        `Graduation year (${student.graduationYear}) is not in eligible batch (${internship.eligibilityGraduationYears.join(', ')})`
      );
    }

    if (
      internship.eligibilityDegrees.length > 0 &&
      student.degree &&
      !internship.eligibilityDegrees.some((d) =>
        student.degree?.toLowerCase().includes(d.toLowerCase())
      )
    ) {
      ineligibilityReasons.push(`Degree (${student.degree}) does not match requirements`);
    }

    // 2. Skill Overlap & Gap Scoring
    const studentSkillMap = new Map<string, { level: string; score?: number | null }>();
    student.skills.forEach((s) => {
      studentSkillMap.set(s.skillId, { level: s.declaredLevel, score: s.verifiedScore });
      studentSkillMap.set(s.skillName.toLowerCase(), { level: s.declaredLevel, score: s.verifiedScore });
    });

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let skillScoreSum = 0;

    internship.requiredSkills.forEach((req) => {
      const match =
        studentSkillMap.get(req.skillId) || studentSkillMap.get(req.skillName.toLowerCase());

      if (match) {
        matchedSkills.push(req.skillName);
        // Base match credit
        let points = 0.8;
        // Boost if verified score exists
        if (match.score !== undefined && match.score !== null) {
          points = Math.min(1.0, 0.7 + (match.score / 100) * 0.3);
        }
        skillScoreSum += points;
      } else {
        missingSkills.push(req.skillName);
      }
    });

    const totalRequired = internship.requiredSkills.length;
    const skillsScore = totalRequired > 0 ? (skillScoreSum / totalRequired) * 100 : 100;

    // 3. Preferences (Work Mode)
    let preferencesScore = 50;
    if (student.preferredWorkModes && student.preferredWorkModes.length > 0) {
      if (student.preferredWorkModes.includes(internship.workMode)) {
        preferencesScore = 100;
      } else if (internship.workMode === 'REMOTE') {
        preferencesScore = 80;
      } else {
        preferencesScore = 30;
      }
    }

    // 4. Location Match
    let locationScore = 60;
    if (internship.workMode === 'REMOTE') {
      locationScore = 100;
    } else if (
      internship.locationCity &&
      student.locationCity &&
      internship.locationCity.toLowerCase() === student.locationCity.toLowerCase()
    ) {
      locationScore = 100;
    } else if (
      internship.locationState &&
      student.locationState &&
      internship.locationState.toLowerCase() === student.locationState.toLowerCase()
    ) {
      locationScore = 75;
    } else {
      locationScore = 40;
    }

    // 5. Verification Boost
    let verificationScore = 50;
    if (internship.companyVerificationStatus === 'VERIFIED') {
      verificationScore = 100;
    } else if (internship.companyVerificationStatus === 'PENDING_REVIEW') {
      verificationScore = 60;
    }

    // Weighted Total
    const finalPercentage = Math.round(
      (skillsScore * weights.skillsWeight +
        preferencesScore * weights.preferencesWeight +
        locationScore * weights.locationWeight +
        verificationScore * weights.verificationWeight)
    );

    // Human-readable Explanation
    const reasons: string[] = [];
    if (matchedSkills.length > 0) {
      reasons.push(`Matched ${matchedSkills.length} required skill(s): ${matchedSkills.join(', ')}.`);
    }
    if (missingSkills.length > 0) {
      reasons.push(`Opportunity to develop ${missingSkills.length} skill(s): ${missingSkills.join(', ')}.`);
    }
    if (preferencesScore === 100) {
      reasons.push(`Aligns directly with your preferred ${internship.workMode.toLowerCase()} work mode.`);
    }
    if (internship.companyVerificationStatus === 'VERIFIED') {
      reasons.push('Listed by a verified, authenticated employer.');
    }

    const explanationText =
      reasons.length > 0
        ? reasons.join(' ')
        : 'Match calculated based on overall profile and declared preferences.';

    return {
      isEligible: ineligibilityReasons.length === 0,
      ineligibilityReasons,
      matchPercentage: Math.min(100, Math.max(0, finalPercentage)),
      matchedSkills,
      missingSkills,
      explanationText,
      breakdown: {
        skillsScore: Math.round(skillsScore),
        preferencesScore: Math.round(preferencesScore),
        locationScore: Math.round(locationScore),
        verificationScore: Math.round(verificationScore),
      },
    };
  }
}

export const matchingService = new RuleBasedMatchingService();
