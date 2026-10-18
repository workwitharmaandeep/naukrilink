export const USER_ROLES = ['STUDENT', 'COMPANY', 'COLLEGE', 'ADMIN', 'SUPER_ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'PENDING_REVIEW',
  'VERIFIED',
  'REJECTED',
  'SUSPENDED',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const WORK_MODES = ['REMOTE', 'ONSITE', 'HYBRID'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const INTERNSHIP_STATUSES = ['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED'] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const QUESTION_STATUSES = ['DRAFT', 'APPROVED', 'ARCHIVED'] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const QUESTION_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const MENTORSHIP_STATUSES = ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'] as const;
export type MentorshipStatus = (typeof MENTORSHIP_STATUSES)[number];

export const ENROLMENT_STATUSES = ['ENROLLED', 'ATTENDED', 'CANCELLED'] as const;
export type EnrolmentStatus = (typeof ENROLMENT_STATUSES)[number];

// Factual reference taxonomy: 28 States and 8 Union Territories of India
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// Factual Industry / Internship Categories
export const INTERNSHIP_CATEGORIES = [
  'Software Development',
  'Frontend Engineering',
  'Backend Engineering',
  'Full Stack Development',
  'Mobile App Development',
  'Data Science & Analytics',
  'Machine Learning & AI',
  'DevOps & Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
  'Product Management',
  'Quality Assurance & Testing',
  'Digital Marketing',
  'Business Analytics',
  'Finance & Accounting',
  'Human Resources',
] as const;

// Standard Skills Taxonomy (factual seeds)
export const STANDARD_SKILLS_TAXONOMY = [
  { name: 'JavaScript', category: 'Programming Languages' },
  { name: 'TypeScript', category: 'Programming Languages' },
  { name: 'Python', category: 'Programming Languages' },
  { name: 'Java', category: 'Programming Languages' },
  { name: 'C++', category: 'Programming Languages' },
  { name: 'SQL', category: 'Database' },
  { name: 'React', category: 'Frontend Development' },
  { name: 'Next.js', category: 'Frontend Development' },
  { name: 'Vue.js', category: 'Frontend Development' },
  { name: 'Node.js', category: 'Backend Development' },
  { name: 'Express.js', category: 'Backend Development' },
  { name: 'Django', category: 'Backend Development' },
  { name: 'FastAPI', category: 'Backend Development' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Docker', category: 'DevOps & Cloud' },
  { name: 'Kubernetes', category: 'DevOps & Cloud' },
  { name: 'AWS', category: 'DevOps & Cloud' },
  { name: 'Git & GitHub', category: 'Tools & Version Control' },
  { name: 'HTML5 & CSS3', category: 'Frontend Development' },
  { name: 'Tailwind CSS', category: 'Frontend Development' },
  { name: 'Data Structures & Algorithms', category: 'Computer Science Fundamentals' },
  { name: 'Object-Oriented Programming', category: 'Computer Science Fundamentals' },
  { name: 'Machine Learning', category: 'Artificial Intelligence' },
  { name: 'Natural Language Processing', category: 'Artificial Intelligence' },
  { name: 'UI/UX Design & Figma', category: 'Design' },
] as const;
