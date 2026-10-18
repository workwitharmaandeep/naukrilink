import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

const STANDARD_SKILLS = [
  { name: 'JavaScript', category: 'Programming Languages', description: 'Core language for web and fullstack runtime environments' },
  { name: 'TypeScript', category: 'Programming Languages', description: 'Statically typed superset of JavaScript' },
  { name: 'Python', category: 'Programming Languages', description: 'General-purpose programming language for backend and AI' },
  { name: 'Java', category: 'Programming Languages', description: 'Class-based, object-oriented language for enterprise development' },
  { name: 'C++', category: 'Programming Languages', description: 'High-performance compiled systems programming language' },
  { name: 'SQL', category: 'Database', description: 'Standard language for relational database management' },
  { name: 'React', category: 'Frontend Development', description: 'Component-based declarative UI library' },
  { name: 'Next.js', category: 'Frontend Development', description: 'React framework for server rendering and static generation' },
  { name: 'Vue.js', category: 'Frontend Development', description: 'Progressive JavaScript framework for building user interfaces' },
  { name: 'Node.js', category: 'Backend Development', description: 'Server-side asynchronous event-driven JavaScript runtime' },
  { name: 'Express.js', category: 'Backend Development', description: 'Minimalist web framework for Node.js' },
  { name: 'Django', category: 'Backend Development', description: 'High-level Python web framework encouraging rapid development' },
  { name: 'FastAPI', category: 'Backend Development', description: 'Modern, fast web framework for building APIs with Python' },
  { name: 'PostgreSQL', category: 'Database', description: 'Powerful, open-source object-relational database system' },
  { name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database system' },
  { name: 'Redis', category: 'Database', description: 'In-memory key-value data structure store' },
  { name: 'Docker', category: 'DevOps & Cloud', description: 'Platform for building, sharing, and running containerized applications' },
  { name: 'Kubernetes', category: 'DevOps & Cloud', description: 'Automated container orchestration system' },
  { name: 'AWS', category: 'DevOps & Cloud', description: 'Cloud computing platform and infrastructure services' },
  { name: 'Git & GitHub', category: 'Tools & Version Control', description: 'Distributed version control and collaboration system' },
  { name: 'HTML5 & CSS3', category: 'Frontend Development', description: 'Foundational web technologies for structure and visual presentation' },
  { name: 'Tailwind CSS', category: 'Frontend Development', description: 'Utility-first CSS framework for rapid UI styling' },
  { name: 'Data Structures & Algorithms', category: 'Computer Science Fundamentals', description: 'Core problem solving, computational complexity, and data structures' },
  { name: 'Object-Oriented Programming', category: 'Computer Science Fundamentals', description: 'Core software design paradigms based on objects and classes' },
  { name: 'Machine Learning', category: 'Artificial Intelligence', description: 'Algorithms and statistical models for predictive analytics' },
  { name: 'Natural Language Processing', category: 'Artificial Intelligence', description: 'Computational techniques for processing human natural language' },
  { name: 'UI/UX Design & Figma', category: 'Design', description: 'Interface layout, wireframing, prototyping, and user experience design' },
];

async function main() {
  console.log('🌱 Starting database seed (factual reference data & Super Admin only)...');

  // 1. Seed standard factual skills taxonomy
  console.log(`Seeding ${STANDARD_SKILLS.length} standard skills...`);
  for (const skill of STANDARD_SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {
        category: skill.category,
        description: skill.description,
      },
      create: {
        name: skill.name,
        category: skill.category,
        description: skill.description,
      },
    });
  }
  console.log('✅ Skills taxonomy seeded successfully.');

  // 2. Seed Super Admin account from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexaura.gov.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SuperAdmin@Nexaura2026!';

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log(`✅ Super Admin created/updated: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log('🎉 Seed completed with ZERO fake data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
