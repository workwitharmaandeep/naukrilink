import { PrismaClient, WorkMode, InternshipStatus, MentorshipStatus, SkillLevel, VerificationStatus, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMockData() {
  console.log('🚀 Seeding authentic mock data for Internships & Mentorship Sessions only...\n');

  // 1. Fetch available skills to link to internships
  const allSkills = await prisma.skill.findMany();
  const skillMap = new Map<string, string>();
  for (const s of allSkills) {
    skillMap.set(s.name, s.id);
  }

  // Helper to get skill ID safely
  const getSkillId = (name: string) => {
    const id = skillMap.get(name);
    if (!id) {
      console.warn(`Skill "${name}" not found in database.`);
    }
    return id;
  };

  // 2. Create Top Verified Employers
  const passwordHash = await bcrypt.hash('CompanyPass@2026!', 10);

  const companiesData = [
    {
      email: 'recruiting@razorpay.com',
      legalName: 'Razorpay Software Private Limited',
      brandName: 'Razorpay',
      industry: 'Fintech & Payments',
      companySize: '1000-5000',
      websiteUrl: 'https://razorpay.com',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&q=80',
      city: 'Bangalore',
      state: 'Karnataka',
      gstin: '29AABCR1234F1Z5',
      cin: 'U72200KA2013PTC071234',
      description: 'Razorpay is India’s leading full-stack financial services and digital payments company.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'Automated MCA & GSTIN registry lookup confirmed active company.',
    },
    {
      email: 'careers@postman.com',
      legalName: 'Postman Software India Private Limited',
      brandName: 'Postman',
      industry: 'Developer Tools & SaaS',
      companySize: '500-1000',
      websiteUrl: 'https://postman.com',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
      city: 'Bangalore',
      state: 'Karnataka',
      gstin: '29AABCP9876E1Z2',
      cin: 'U72200KA2014PTC078910',
      description: 'Postman is the leading API development platform used by over 30 million developers worldwide.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'Statutory verification completed with corporate domain identity audit.',
    },
    {
      email: 'talent@zomato.com',
      legalName: 'Zomato Limited',
      brandName: 'Zomato',
      industry: 'Consumer Internet & AI',
      companySize: '5000+',
      websiteUrl: 'https://zomato.com',
      logoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=128&q=80',
      city: 'Gurugram',
      state: 'Haryana',
      gstin: '06AAACZ1122D1Z8',
      cin: 'L93030HR2010PLC040638',
      description: 'Zomato is a technology platform connecting customers, restaurant partners and delivery partners with cutting edge AI.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'NSE/BSE listed public entity verified via MCA portal.',
    },
    {
      email: 'internships@cred.club',
      legalName: 'Dreamplug Technologies Private Limited',
      brandName: 'CRED',
      industry: 'Fintech & High Design',
      companySize: '500-1000',
      websiteUrl: 'https://cred.club',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&q=80',
      city: 'Bangalore',
      state: 'Karnataka',
      gstin: '29AADCD5544B1Z9',
      cin: 'U74999KA2018PTC112345',
      description: 'CRED is a members-only club that rewards creditworthy individuals with exceptional financial and lifestyle products.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'Audited and verified corporate records.',
    },
    {
      email: 'university@browserstack.com',
      legalName: 'BrowserStack Software Private Limited',
      brandName: 'BrowserStack',
      industry: 'Cloud Testing & Infrastructure',
      companySize: '1000-5000',
      websiteUrl: 'https://browserstack.com',
      logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&q=80',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AABCB3322A1Z1',
      cin: 'U72900MH2011PTC218765',
      description: 'BrowserStack is the world’s leading web and mobile software testing platform on the cloud.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'Domain and MCA identity verified.',
    },
    {
      email: 'engineering@zerodha.com',
      legalName: 'Zerodha Broking Limited',
      brandName: 'Zerodha',
      industry: 'Capital Markets & FOSS',
      companySize: '1000-5000',
      websiteUrl: 'https://zerodha.com',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&q=80',
      city: 'Bangalore',
      state: 'Karnataka',
      gstin: '29AABCZ7788C1Z4',
      cin: 'U65929KA2010PLC052856',
      description: 'Zerodha is India’s largest stock broker by active clients, pioneering zero-brokerage trading and open source software.',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedNotes: 'SEBI and MCA verified registered financial brokerage.',
    },
  ];

  const createdCompanies: any[] = [];

  for (const comp of companiesData) {
    const user = await prisma.user.upsert({
      where: { email: comp.email },
      update: {
        role: UserRole.COMPANY,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
      create: {
        email: comp.email,
        passwordHash,
        role: UserRole.COMPANY,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    const companyProfile = await prisma.companyProfile.upsert({
      where: { userId: user.id },
      update: {
        legalName: comp.legalName,
        brandName: comp.brandName,
        industry: comp.industry,
        companySize: comp.companySize,
        websiteUrl: comp.websiteUrl,
        logoUrl: comp.logoUrl,
        city: comp.city,
        state: comp.state,
        gstin: comp.gstin,
        cin: comp.cin,
        description: comp.description,
        verificationStatus: comp.verificationStatus,
        verificationNotes: comp.verifiedNotes,
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        legalName: comp.legalName,
        brandName: comp.brandName,
        industry: comp.industry,
        companySize: comp.companySize,
        websiteUrl: comp.websiteUrl,
        logoUrl: comp.logoUrl,
        addressLine1: `${comp.city} Tech Park`,
        city: comp.city,
        state: comp.state,
        pincode: '560100',
        contactPersonName: 'Talent Acquisition Team',
        contactPersonPhone: '+91 98765 43210',
        contactPersonDesignation: 'Campus Hiring Lead',
        gstin: comp.gstin,
        cin: comp.cin,
        description: comp.description,
        verificationStatus: comp.verificationStatus,
        verificationNotes: comp.verifiedNotes,
        verifiedAt: new Date(),
      },
    });

    createdCompanies.push(companyProfile);
  }

  console.log(`✅ ${createdCompanies.length} verified companies created/updated.`);

  // 3. Clean up any existing internships / sessions for a fresh, clean mock set
  await prisma.internshipSkill.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.matchScore.deleteMany({});
  await prisma.internship.deleteMany({});
  await prisma.mentorshipEnrolment.deleteMany({});
  await prisma.mentorshipSlot.deleteMany({});
  await prisma.mentorshipSession.deleteMany({});

  const compByBrand = (brand: string) => createdCompanies.find((c) => c.brandName === brand)!;

  // 4. Seed Diverse Internships
  const futureDeadline = new Date();
  futureDeadline.setDate(futureDeadline.getDate() + 45);

  const internshipsData = [
    {
      companyProfileId: compByBrand('Razorpay').id,
      title: 'Frontend Developer Intern (React & Next.js)',
      category: 'Software Development',
      description: 'Join the Razorpay Checkout & Merchant Dashboard engineering group to build pixel-perfect, accessible, and high-performance payment interfaces used by millions of merchants daily.',
      responsibilities: 'Develop high-performance UI components with React and Next.js. Collaborate closely with product designers to implement smooth user flows. Optimize bundle sizes and Core Web Vitals across low-bandwidth connections.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
      eligibilityGraduationYears: [2025, 2026, 2027],
      minCgpa: 7.0,
      workMode: WorkMode.HYBRID,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 45000,
      openingsCount: 4,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'React', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'TypeScript', minLevel: SkillLevel.BEGINNER, isRequired: true },
        { name: 'JavaScript', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Next.js', minLevel: SkillLevel.BEGINNER, isRequired: false },
        { name: 'HTML5 & CSS3', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
      ],
    },
    {
      companyProfileId: compByBrand('Postman').id,
      title: 'Backend Systems Intern (Node.js & Distributed APIs)',
      category: 'Backend Development',
      description: 'Work on Postman cloud runtime infrastructure handling billions of API requests per month. Learn real-world distributed architectures, database indexing, and low-latency API design.',
      responsibilities: 'Design and maintain high-throughput REST and WebSocket microservices in Node.js. Write clean, modular TypeScript code with 90%+ unit test coverage. Implement caching strategies using Redis and PostgreSQL.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology', 'Data Science'],
      eligibilityGraduationYears: [2025, 2026],
      minCgpa: 7.5,
      workMode: WorkMode.REMOTE,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 50000,
      openingsCount: 3,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'Node.js', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Express.js', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'SQL', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'PostgreSQL', minLevel: SkillLevel.BEGINNER, isRequired: false },
        { name: 'Redis', minLevel: SkillLevel.BEGINNER, isRequired: false },
        { name: 'Docker', minLevel: SkillLevel.BEGINNER, isRequired: false },
      ],
    },
    {
      companyProfileId: compByBrand('Zomato').id,
      title: 'AI & Machine Learning Research Intern',
      category: 'Artificial Intelligence',
      description: 'Contribute to Zomato’s Recommendation and Dynamic Pricing AI engines. Build transformer-based models and natural language processing pipelines for menu understanding and hyper-local search.',
      responsibilities: 'Train, fine-tune, and evaluate machine learning models for customer personalization. Preprocess large-scale multi-modal food imagery and customer feedback. Build deployment pipelines with Python and FastAPI.',
      eligibilityDegrees: ['B.Tech', 'M.Tech', 'MS', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Artificial Intelligence', 'Data Science', 'Mathematics'],
      eligibilityGraduationYears: [2025, 2026],
      minCgpa: 8.0,
      workMode: WorkMode.ONSITE,
      locationCity: 'Gurugram',
      locationState: 'Haryana',
      durationMonths: 6,
      stipendAmount: 60000,
      openingsCount: 2,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'Python', minLevel: SkillLevel.ADVANCED, isRequired: true },
        { name: 'Machine Learning', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Natural Language Processing', minLevel: SkillLevel.INTERMEDIATE, isRequired: false },
        { name: 'FastAPI', minLevel: SkillLevel.BEGINNER, isRequired: false },
        { name: 'SQL', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
      ],
    },
    {
      companyProfileId: compByBrand('CRED').id,
      title: 'Product Design & UI/UX Intern',
      category: 'Design & Frontend',
      description: 'Immerse yourself in CRED’s design culture. Craft visceral, tactile user interfaces, interactive 3D elements, and clean micro-interactions for credit-worthy cardholders.',
      responsibilities: 'Produce interactive prototypes and components in Figma. Partner with engineering to ensure design fidelity in production. Conduct user usability studies and iterate on user flows.',
      eligibilityDegrees: ['Any Degree', 'B.Des', 'B.Tech', 'BCA'],
      eligibilityBranches: ['Design', 'Computer Science', 'Any Branch'],
      eligibilityGraduationYears: [2025, 2026, 2027],
      minCgpa: 6.5,
      workMode: WorkMode.ONSITE,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 55000,
      openingsCount: 2,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'UI/UX Design & Figma', minLevel: SkillLevel.ADVANCED, isRequired: true },
        { name: 'HTML5 & CSS3', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Tailwind CSS', minLevel: SkillLevel.BEGINNER, isRequired: false },
      ],
    },
    {
      companyProfileId: compByBrand('BrowserStack').id,
      title: 'DevOps & Cloud Infrastructure Intern',
      category: 'DevOps & Cloud',
      description: 'Manage BrowserStack’s fleet of thousands of real mobile devices and cloud server instances. Gain hands-on exposure to Kubernetes clusters, automated CI/CD, and infrastructure-as-code.',
      responsibilities: 'Automate deployment pipelines and telemetry alerts using Docker and Kubernetes. Monitor cloud resource utilization and optimize spot instances. Troubleshoot network and container orchestration bottlenecks.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology', 'Electronics'],
      eligibilityGraduationYears: [2025, 2026],
      minCgpa: 7.0,
      workMode: WorkMode.REMOTE,
      locationCity: 'Mumbai',
      locationState: 'Maharashtra',
      durationMonths: 6,
      stipendAmount: 40000,
      openingsCount: 3,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'Docker', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Kubernetes', minLevel: SkillLevel.BEGINNER, isRequired: true },
        { name: 'AWS', minLevel: SkillLevel.BEGINNER, isRequired: false },
        { name: 'Git & GitHub', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Python', minLevel: SkillLevel.BEGINNER, isRequired: false },
      ],
    },
    {
      companyProfileId: compByBrand('Zerodha').id,
      title: 'Full Stack Engineering Intern (FOSS & Python)',
      category: 'Full Stack Development',
      description: 'Join Zerodha’s tech team building Kite and Console. We believe in minimalist, fast architectures, self-hosted services, and open source contributions without framework bloat.',
      responsibilities: 'Write robust backend services in Python and Go. Build responsive, lightweight client interfaces in React and vanilla JavaScript. Write SQL queries optimized for millions of concurrent records.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA', 'B.Sc'],
      eligibilityBranches: ['Computer Science', 'Any Branch'],
      eligibilityGraduationYears: [2025, 2026, 2027],
      minCgpa: 6.0,
      workMode: WorkMode.REMOTE,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 45000,
      openingsCount: 3,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'Python', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'React', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'SQL', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'PostgreSQL', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Git & GitHub', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
      ],
    },
    {
      companyProfileId: compByBrand('Razorpay').id,
      title: 'Data Platform Engineer Intern',
      category: 'Data Science & Analytics',
      description: 'Scale Razorpay’s real-time analytics warehouse processing financial settlements, chargeback detections, and financial ledger logs.',
      responsibilities: 'Build batch and streaming data pipelines using SQL and Python. Work with distributed databases and ensure ACID compliance for transaction ledgers. Create automated dashboards for business metrics.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology', 'Data Science'],
      eligibilityGraduationYears: [2025, 2026],
      minCgpa: 7.0,
      workMode: WorkMode.HYBRID,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 42000,
      openingsCount: 2,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'SQL', minLevel: SkillLevel.ADVANCED, isRequired: true },
        { name: 'Python', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'PostgreSQL', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'Docker', minLevel: SkillLevel.BEGINNER, isRequired: false },
      ],
    },
    {
      companyProfileId: compByBrand('CRED').id,
      title: 'Mobile App Developer Intern (React Native)',
      category: 'Mobile Development',
      description: 'Build native-grade mobile experiences with high frame-rate animations, haptic feedback, and secure payment SDKs on iOS and Android.',
      responsibilities: 'Develop user-facing features in React Native and TypeScript. Profile JS bridge performance and memory leaks. Collaborate with backend teams on offline sync and encryption protocols.',
      eligibilityDegrees: ['B.Tech', 'B.E', 'BCA', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology'],
      eligibilityGraduationYears: [2025, 2026],
      minCgpa: 7.0,
      workMode: WorkMode.HYBRID,
      locationCity: 'Bangalore',
      locationState: 'Karnataka',
      durationMonths: 6,
      stipendAmount: 50000,
      openingsCount: 2,
      deadline: futureDeadline,
      status: InternshipStatus.PUBLISHED,
      skills: [
        { name: 'React', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'JavaScript', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
        { name: 'TypeScript', minLevel: SkillLevel.BEGINNER, isRequired: true },
        { name: 'HTML5 & CSS3', minLevel: SkillLevel.INTERMEDIATE, isRequired: true },
      ],
    },
  ];

  for (const item of internshipsData) {
    const { skills, ...internshipFields } = item;

    const internship = await prisma.internship.create({
      data: internshipFields,
    });

    for (const req of skills) {
      const skillId = getSkillId(req.name);
      if (skillId) {
        await prisma.internshipSkill.create({
          data: {
            internshipId: internship.id,
            skillId,
            minLevel: req.minLevel,
            isRequired: req.isRequired,
          },
        });
      }
    }
  }

  console.log(`✅ ${internshipsData.length} published internships with skill requirements seeded.`);

  // 5. Seed Mentorship Sessions with Upcoming Slots
  const now = new Date();

  // Helper to create future slot date
  const createSlot = (daysFromNow: number, startHour: number, durationHours: number = 1) => {
    const start = new Date(now);
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(startHour + durationHours, 0, 0, 0);

    return {
      startTime: start,
      endTime: end,
    };
  };

  const mentorshipSessionsData = [
    {
      companyProfileId: compByBrand('Razorpay').id,
      title: 'Cracking Modern Frontend Interviews: System Design & React Internals',
      topic: 'Technical Interview Prep',
      description: 'Join Razorpay Staff Engineer for a deep dive into frontend system design interviews, React reconciliation, DOM virtualizing, state management patterns, and live mock problem walkthroughs.',
      targetSkills: ['React', 'JavaScript', 'TypeScript', 'Next.js'],
      targetRoles: ['Frontend Developer', 'Full Stack Engineer'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-razorpay-prep',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(1, 17, 1), capacity: 15 },
        { ...createSlot(3, 11, 1), capacity: 15 },
        { ...createSlot(7, 18, 1), capacity: 20 },
      ],
    },
    {
      companyProfileId: compByBrand('Postman').id,
      title: 'Building Resilient Microservices & Production APIs with Node.js',
      topic: 'Backend Architecture',
      description: 'Learn how Postman scales services to millions of developers. We will explore distributed tracing, idempotency keys, Redis rate-limiting, connection pooling, and error handling architectures.',
      targetSkills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker'],
      targetRoles: ['Backend Engineer', 'Systems Engineer'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-postman-api',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(2, 18, 1), capacity: 20 },
        { ...createSlot(5, 16, 1), capacity: 20 },
      ],
    },
    {
      companyProfileId: compByBrand('CRED').id,
      title: 'From College to CRED: Building a Standout Design & Engineering Portfolio',
      topic: 'Portfolio & Career Guidance',
      description: 'CRED leads review candidate portfolios live! Get brutal, actionable feedback on your GitHub repositories, personal side projects, design case studies, and resume positioning.',
      targetSkills: ['UI/UX Design & Figma', 'React', 'HTML5 & CSS3'],
      targetRoles: ['Product Designer', 'Frontend Engineer'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-cred-portfolio',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(2, 19, 1), capacity: 12 },
        { ...createSlot(6, 15, 1), capacity: 12 },
      ],
    },
    {
      companyProfileId: compByBrand('Zomato').id,
      title: 'Applied AI & ML in Production: Realities Beyond Jupyter Notebooks',
      topic: 'Machine Learning & AI',
      description: 'Zomato AI Engineering team explores what it actually takes to deploy predictive models at 100k requests/sec. Covers feature stores, model quantization, latency budgets, and continuous evaluation.',
      targetSkills: ['Python', 'Machine Learning', 'Natural Language Processing', 'FastAPI'],
      targetRoles: ['AI/ML Engineer', 'Data Scientist'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-zomato-ai',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(3, 17, 1), capacity: 25 },
        { ...createSlot(8, 16, 1), capacity: 25 },
      ],
    },
    {
      companyProfileId: compByBrand('BrowserStack').id,
      title: 'DevOps Bootcamp: Mastering Docker Containers & Kubernetes Orchestration',
      topic: 'Cloud & Infrastructure',
      description: 'Hands-on live terminal session building multi-stage Docker builds, writing Kubernetes manifests, setting up persistent volumes, and automating CI/CD pipelines with GitHub Actions.',
      targetSkills: ['Docker', 'Kubernetes', 'AWS', 'Git & GitHub'],
      targetRoles: ['DevOps Engineer', 'Cloud Architect'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-browserstack-cloud',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(4, 11, 2), capacity: 30 },
        { ...createSlot(9, 10, 2), capacity: 30 },
      ],
    },
    {
      companyProfileId: compByBrand('Zerodha').id,
      title: 'Minimalist Engineering: Building High Throughput Systems with FOSS & Clean Code',
      topic: 'Software Craftsmanship',
      description: 'Zerodha tech leaders discuss the philosophy of building software that lasts. Why you do not need 50 microservices on day one, how to master SQL fundamentals, and how to write un-fancy code.',
      targetSkills: ['Python', 'SQL', 'PostgreSQL', 'Data Structures & Algorithms'],
      targetRoles: ['Software Engineer', 'Full Stack Developer'],
      mode: WorkMode.REMOTE,
      meetingLink: 'https://meet.google.com/nex-zerodha-foss',
      status: MentorshipStatus.SCHEDULED,
      slots: [
        { ...createSlot(4, 18, 1), capacity: 25 },
        { ...createSlot(10, 16, 1), capacity: 25 },
      ],
    },
  ];

  for (const sessionData of mentorshipSessionsData) {
    const { slots, ...sessionFields } = sessionData;

    const session = await prisma.mentorshipSession.create({
      data: sessionFields,
    });

    for (const slot of slots) {
      await prisma.mentorshipSlot.create({
        data: {
          mentorshipSessionId: session.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity,
          bookedCount: 0,
        },
      });
    }
  }

  console.log(`✅ ${mentorshipSessionsData.length} mentorship sessions with slots seeded successfully.`);

  console.log('\n🎉 Mock data generation for Internships & Mentorship sessions COMPLETE!');
}

seedMockData()
  .catch((e) => {
    console.error('❌ Error seeding mock data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
