import assert from 'assert';
import { validateGstin, validateCin, validateEmailDomainMatch } from '../src/modules/verification/verification.validator';
import { RuleBasedMatchingService, StudentMatchProfile, InternshipMatchProfile } from '../src/modules/matching/matching.service';

console.log('🧪 Running NEXAURA Phase 1 Unit Tests...\n');

// -------------------------------------------------------------
// Test 1: GSTIN Verification Validator
// -------------------------------------------------------------
console.log('▶ Test 1: GSTIN Validation');
// Valid GSTIN format with valid checksum (e.g. standard mock 22AAAAA0000A1Z5)
const validGstinRes = validateGstin('22AAAAA0000A1ZC');
assert.strictEqual(validGstinRes.isValid, true, 'Valid GSTIN should pass verification');

const invalidGstinFormat = validateGstin('INVALID_GSTIN_123');
assert.strictEqual(invalidGstinFormat.isValid, false, 'Invalid format GSTIN must fail');

const emptyGstin = validateGstin('');
assert.strictEqual(emptyGstin.isValid, false, 'Empty GSTIN must fail');
console.log('✅ GSTIN validator passed all test cases.\n');

// -------------------------------------------------------------
// Test 2: CIN Verification Validator
// -------------------------------------------------------------
console.log('▶ Test 2: CIN Validation');
const validCinRes = validateCin('U72200MH2020PTC123456');
assert.strictEqual(validCinRes.isValid, true, 'Valid MCA CIN should pass');

const invalidCinRes = validateCin('X12345MH2020PTC123456');
assert.strictEqual(invalidCinRes.isValid, false, 'CIN not starting with L or U must fail');

const invalidYearCin = validateCin('U72200MH1800PTC123456');
assert.strictEqual(invalidYearCin.isValid, false, 'CIN with impossible incorporation year must fail');
console.log('✅ CIN validator passed all test cases.\n');

// -------------------------------------------------------------
// Test 3: Domain Identity Matching
// -------------------------------------------------------------
console.log('▶ Test 3: Email & Website Domain Matching');
assert.strictEqual(
  validateEmailDomainMatch('hr@nexatech.com', 'https://nexatech.com'),
  true,
  'Matching official email and website domain must pass'
);
assert.strictEqual(
  validateEmailDomainMatch('recruiter@careers.nexatech.com', 'https://nexatech.com'),
  true,
  'Subdomain email matching main corporate website must pass'
);
assert.strictEqual(
  validateEmailDomainMatch('scammer@gmail.com', 'https://nexatech.com'),
  false,
  'Generic freemail domain for corporate website must fail'
);
console.log('✅ Email-domain matching passed all test cases.\n');

// -------------------------------------------------------------
// Test 4: Rule-based Smart Internship Matching Engine
// -------------------------------------------------------------
console.log('▶ Test 4: Smart Internship Matching Engine');
const matchingService = new RuleBasedMatchingService();

const student: StudentMatchProfile = {
  id: 'student-1',
  degree: 'B.Tech Computer Science',
  branch: 'Computer Science',
  graduationYear: 2025,
  cgpa: 8.5,
  locationCity: 'Bangalore',
  locationState: 'Karnataka',
  preferredWorkModes: ['REMOTE', 'HYBRID'],
  skills: [
    { skillId: 's1', skillName: 'React', declaredLevel: 'INTERMEDIATE', verifiedScore: 85 },
    { skillId: 's2', skillName: 'Node.js', declaredLevel: 'BEGINNER', verifiedScore: 70 },
  ],
};

const internship: InternshipMatchProfile = {
  id: 'intern-1',
  title: 'Full Stack Web Developer Intern',
  category: 'Software Development',
  eligibilityDegrees: ['B.Tech', 'B.E.'],
  eligibilityBranches: ['Computer Science'],
  eligibilityGraduationYears: [2025, 2026],
  minCgpa: 7.0,
  workMode: 'REMOTE',
  locationCity: 'Bangalore',
  companyVerificationStatus: 'VERIFIED',
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days in future
  requiredSkills: [
    { skillId: 's1', skillName: 'React', minLevel: 'BEGINNER', isRequired: true },
    { skillId: 's2', skillName: 'Node.js', minLevel: 'BEGINNER', isRequired: true },
    { skillId: 's3', skillName: 'Docker', minLevel: 'BEGINNER', isRequired: false },
  ],
};

const matchResult = matchingService.calculateMatch(student, internship);
assert.strictEqual(matchResult.isEligible, true, 'Student should be eligible');
assert.strictEqual(matchResult.matchedSkills.length, 2, 'Should match React and Node.js');
assert.strictEqual(matchResult.missingSkills.length, 1, 'Should identify Docker as missing skill');
assert.strictEqual(matchResult.missingSkills[0], 'Docker', 'Missing skill should be Docker');
assert.ok(matchResult.matchPercentage > 70, `Match percentage should be high (>70), was ${matchResult.matchPercentage}`);
assert.ok(matchResult.explanationText.length > 20, 'Should include transparent explanation');
console.log(`✅ Matching engine passed (Match score: ${matchResult.matchPercentage}%, Matched: ${matchResult.matchedSkills.join(', ')}, Missing: ${matchResult.missingSkills.join(', ')}).\n`);

// -------------------------------------------------------------
// Test 5: Ineligibility Hard Filter Check
// -------------------------------------------------------------
console.log('▶ Test 5: Hard Ineligibility Filter Checks');
const lowCgpaStudent: StudentMatchProfile = {
  ...student,
  cgpa: 6.5,
};
const ineligibilityResult = matchingService.calculateMatch(lowCgpaStudent, internship);
assert.strictEqual(ineligibilityResult.isEligible, false, 'Student with CGPA below 7.0 must be flagged ineligible');
assert.ok(ineligibilityResult.ineligibilityReasons.some((r) => r.includes('CGPA')), 'Ineligibility reason must specify CGPA');
console.log('✅ Hard filter ineligibility check passed.\n');

console.log('🎉 ALL 5 UNIT TEST SUITES PASSED SUCCESSFULLY!');
