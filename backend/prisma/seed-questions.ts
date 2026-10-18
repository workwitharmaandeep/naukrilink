import { PrismaClient, QuestionStatus, QuestionDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedQuestion {
  skillName: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
}

export const FACTUAL_QUESTIONS: SeedQuestion[] = [
  // -------------------------------------------------------------
  // REACT
  // -------------------------------------------------------------
  {
    skillName: 'React',
    questionText: 'What is the primary purpose of the dependency array in React useEffect hook?',
    options: [
      'To define which child components receive the effect props',
      'To specify which state or prop values trigger the effect re-execution when changed',
      'To cache the return value of an expensive component calculation',
      'To enforce synchronous execution of DOM mutations before paint',
    ],
    correctAnswerIndex: 1,
    explanation: 'The dependency array in useEffect tells React to only re-run the effect function when one of the listed dependencies has changed between renders. Passing an empty array [] means it runs only once on mount.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'React',
    questionText: 'Why should you avoid using array index as the key prop when rendering dynamic lists in React?',
    options: [
      'Keys must always be integers starting from 0',
      'React throws an unrecoverable runtime exception if index is used',
      'Reordering, inserting, or deleting items can cause component state bugs and inefficient re-renders',
      'Array indices disable Virtual DOM reconciliation completely',
    ],
    correctAnswerIndex: 2,
    explanation: 'Using an index as a key can negatively impact performance and may cause issues with component state if items are reordered, filtered, or inserted into the list. Unique stable identifiers ensure correct component instance reuse.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'React',
    questionText: 'What will happen when the button is clicked in the following component?',
    codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
  };
  return <button onClick={handleClick}>{count}</button>;
}`,
    options: [
      'Count increments by 2 immediately on first render',
      'Count increments by 1 because state updates in the same event loop are batched and refer to the same captured closure state',
      'React throws an invalid state mutation error',
      'Count increments by 2 after a 100ms debounce interval',
    ],
    correctAnswerIndex: 1,
    explanation: 'Because count is 0 in the current render closure, both calls evaluate setCount(0 + 1). To increment by 2 in a single handler, updater functions should be used: setCount(prev => prev + 1).',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'React',
    questionText: 'Which React hook is designed for measuring DOM nodes synchronously before the browser paints the screen?',
    options: ['useEffect', 'useMemo', 'useLayoutEffect', 'useImperativeHandle'],
    correctAnswerIndex: 2,
    explanation: 'useLayoutEffect fires synchronously after all DOM mutations but before the browser paints. It is ideal for measuring layout or preventing visual flicker before the user sees the screen.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'React',
    questionText: 'What is the main benefit of React.memo()?',
    options: [
      'Automatically memoizes all custom hooks defined inside the component',
      'Prevents re-rendering of a functional component if its props have not changed according to shallow equality',
      'Stores component state in browser localStorage across page reloads',
      'Creates a Web Worker thread for computationally heavy JSX rendering',
    ],
    correctAnswerIndex: 1,
    explanation: 'React.memo is a higher-order component that wraps a component to skip re-rendering if its props are shallowly equal to its previous props, optimizing rendering performance.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'React',
    questionText: 'In React 18, what is the role of useDeferredValue?',
    options: [
      'To delay network fetch requests until user idle time',
      'To defer updating a non-urgent part of the UI (such as filtered search results) to keep input responsive',
      'To provide setTimeout replacements inside server components',
      'To schedule batch database mutations on the backend',
    ],
    correctAnswerIndex: 1,
    explanation: 'useDeferredValue accepts a value and returns a copy that will defer updating until urgent updates (like typing in a text field) have completed.',
    difficulty: QuestionDifficulty.HARD,
  },
  {
    skillName: 'React',
    questionText: 'What is a fundamental rule regarding the execution order of React Hooks?',
    options: [
      'Hooks can only be called inside loops if wrapped in a Promise',
      'Hooks must always be called at the top level of a React function component and never inside conditionals, loops, or nested functions',
      'Hooks must be declared in alphabetical order for the compiler',
      'Hooks can be invoked in arbitrary callback handlers',
    ],
    correctAnswerIndex: 1,
    explanation: 'React relies on the call order of hooks to preserve the identity of state and effect variables across successive renders.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'React',
    questionText: 'What is the return type of a React useRef hook?',
    options: [
      'A readonly state tuple containing [value, setter]',
      'A mutable object with a .current property initialized to the passed argument that persists across renders without causing re-renders',
      'A DOM Element node instance attached to window.document',
      'A proxy object that intercepts all property access',
    ],
    correctAnswerIndex: 1,
    explanation: 'useRef returns a mutable ref object whose .current property is initialized with the passed argument and persists for the full lifetime of the component without triggering re-renders when mutated.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'React',
    questionText: 'How does React Server Components (RSC) differ from standard Client Components in Next.js?',
    options: [
      'Server components can use useState and useEffect freely',
      'Server components execute only on the server, have direct access to backend resources, and send zero JavaScript bundle to the browser',
      'Server components cannot return JSX or HTML markup',
      'Server components run exclusively inside browser Service Workers',
    ],
    correctAnswerIndex: 1,
    explanation: 'React Server Components execute strictly on the server and do not ship their JS code to the client bundle, reducing bundle size and speeding up page load times.',
    difficulty: QuestionDifficulty.HARD,
  },
  {
    skillName: 'React',
    questionText: 'What pattern should be used to avoid "prop drilling" across deeply nested React components?',
    options: [
      'Global window variables',
      'React Context API or dedicated state management',
      'Document.querySelector element events',
      'Eval scripts in the root HTML template',
    ],
    correctAnswerIndex: 1,
    explanation: 'React Context provides a way to pass data through the component tree without having to pass props down manually at every level.',
    difficulty: QuestionDifficulty.EASY,
  },

  // -------------------------------------------------------------
  // NODE.JS
  // -------------------------------------------------------------
  {
    skillName: 'Node.js',
    questionText: 'In the Node.js Event Loop, which phase executes callbacks scheduled by setImmediate()?',
    options: ['Timers phase', 'Poll phase', 'Check phase', 'Close callbacks phase'],
    correctAnswerIndex: 2,
    explanation: 'The Check phase of the libuv event loop is specifically dedicated to executing callbacks registered by setImmediate().',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Node.js',
    questionText: 'What is the difference between process.nextTick() and setImmediate() in Node.js?',
    options: [
      'setImmediate() fires before the current operation finishes; process.nextTick() fires on the next tick of the clock',
      'process.nextTick() fires immediately after the current operation before the event loop continues, while setImmediate() fires on the check phase of the event loop',
      'process.nextTick() is asynchronous while setImmediate() blocks the main thread synchronously',
      'There is no difference; they are aliases for each other',
    ],
    correctAnswerIndex: 1,
    explanation: 'process.nextTick queue is processed after the current operation finishes, regardless of the current phase of the event loop. setImmediate executes in the Check phase.',
    difficulty: QuestionDifficulty.HARD,
  },
  {
    skillName: 'Node.js',
    questionText: 'How does Node.js handle CPU-intensive or blocking operations without freezing the main thread?',
    options: [
      'Node.js automatically multithreads all JavaScript code across 16 CPU cores',
      'By delegating filesystem and cryptographic tasks to the libuv threadpool (default 4 threads) or utilizing the worker_threads module',
      'By pausing the operating system kernel until calculation finishes',
      'By compiling JavaScript directly into GPU shaders',
    ],
    correctAnswerIndex: 1,
    explanation: 'Node.js uses a single main thread for JS execution, but offloads blocking I/O and crypto/fs tasks to the libuv threadpool and allows CPU parallelism via worker_threads.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Node.js',
    questionText: 'Which Node.js core module is used for handling binary data buffers directly in memory?',
    options: ['Binary', 'Buffer', 'MemoryStream', 'ByteReader'],
    correctAnswerIndex: 1,
    explanation: 'The Buffer class in Node.js is designed to handle raw binary data directly, allocated outside the V8 heap in raw memory.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Node.js',
    questionText: 'What is the purpose of middleware in an Express.js application?',
    options: [
      'To compile TypeScript files into JavaScript at runtime',
      'Functions that have access to request and response objects and the next function in the application request-response cycle',
      'To establish a persistent WebSocket connection with clients',
      'To automatically manage MySQL database schemas',
    ],
    correctAnswerIndex: 1,
    explanation: 'Express middleware functions execute sequentially to inspect, transform, authenticate requests, and call next() to pass control to subsequent handlers.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Node.js',
    questionText: 'What occurs if an uncaught exception is thrown in a Node.js process and no uncaughtException listener is attached?',
    options: [
      'The process ignores the error and resumes on the next request',
      'The process logs a stack trace to stderr and terminates immediately with exit code 1',
      'The server restarts automatically using browser cookies',
      'The event loop freezes indefinitely in sleep mode',
    ],
    correctAnswerIndex: 1,
    explanation: 'In Node.js, an unhandled exception causes the process to print the stack trace to stderr and terminate with exit code 1 to prevent running in an unstable state.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Node.js',
    questionText: 'What is the advantage of using Streams (like fs.createReadStream) instead of fs.readFile for large files in Node.js?',
    options: [
      'Streams encrypt files with AES-256 automatically',
      'Streams process data in chunks without loading the entire file into RAM, preventing Out-Of-Memory (OOM) crashes',
      'Streams are synchronous and simpler to write',
      'Streams bypass the operating system filesystem permissions',
    ],
    correctAnswerIndex: 1,
    explanation: 'Streams read and write data in manageable chunks, giving high memory efficiency and low latency for large data transfers.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Node.js',
    questionText: 'Which package manager lockfile format is created by default when running npm install in Node.js?',
    options: ['yarn.lock', 'package-lock.json', 'pnpm-lock.yaml', 'dependencies.lock'],
    correctAnswerIndex: 1,
    explanation: 'npm produces package-lock.json to ensure deterministic dependency trees across development and production environments.',
    difficulty: QuestionDifficulty.EASY,
  },

  // -------------------------------------------------------------
  // JAVASCRIPT
  // -------------------------------------------------------------
  {
    skillName: 'JavaScript',
    questionText: 'What is the output of typeof null in JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctAnswerIndex: 2,
    explanation: 'typeof null returning "object" is a historic bug in the original JavaScript implementation from 1995 that has been preserved for backward compatibility.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'JavaScript',
    questionText: 'What is a Closure in JavaScript?',
    options: [
      'A method to close a browser tab programmatically',
      'A function bundled together with references to its surrounding lexical environment (variables in outer scopes)',
      'A syntax error caused by unmatched curly brackets',
      'A function that can only be called once',
    ],
    correctAnswerIndex: 1,
    explanation: 'A closure gives an inner function access to its outer function scope even after the outer function has returned and exited the call stack.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'JavaScript',
    questionText: 'What is the output of the following code snippet?',
    codeSnippet: `console.log(1 + '2' + 3);
console.log(4 - '2');`,
    options: [
      '"123" and 2',
      '"6" and 2',
      '"123" and NaN',
      '6 and NaN',
    ],
    correctAnswerIndex: 0,
    explanation: '1 + "2" performs string concatenation producing "12", which + 3 turns into "123". For subtraction (4 - "2"), the string "2" is coerced to number 2, resulting in 2.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'JavaScript',
    questionText: 'How do arrow functions differ from standard function expressions regarding this binding?',
    options: [
      'Arrow functions have their own dynamic this bound at runtime',
      'Arrow functions do not have their own this; they retain the this value of the enclosing lexical scope',
      'Arrow functions bind this exclusively to the window or global object',
      'Arrow functions cannot be used inside classes',
    ],
    correctAnswerIndex: 1,
    explanation: 'Arrow functions do not define their own this context. They lexically capture the this value of the enclosing execution context.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'JavaScript',
    questionText: 'What does Promise.all() do when one of the passed promises rejects?',
    options: [
      'Waits for all other promises to resolve and ignores the rejection',
      'Rejects immediately with the error of the first promise that rejects (fail-fast behavior)',
      'Retries the rejected promise up to 3 times',
      'Returns null for the failed promise and continues',
    ],
    correctAnswerIndex: 1,
    explanation: 'Promise.all rejects immediately upon any of the input promises rejecting. If you want results for all promises regardless of success, use Promise.allSettled().',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'JavaScript',
    questionText: 'What is the purpose of the JavaScript Event Loop microtask queue?',
    options: [
      'To schedule user mouse movements and clicks',
      'To execute high-priority callbacks like Promise resolution (.then/.catch/await) before the next rendering or macrotask (setTimeout)',
      'To compress images in background threads',
      'To clean up unused global variables',
    ],
    correctAnswerIndex: 1,
    explanation: 'Microtasks (Promises, queueMicrotask) are drained completely at the end of each task before the event loop yields to the browser rendering engine or macrotasks.',
    difficulty: QuestionDifficulty.HARD,
  },
  {
    skillName: 'JavaScript',
    questionText: 'Which ES6 method creates a new shallow copy of an array with elements that pass a testing function?',
    options: ['Array.prototype.map()', 'Array.prototype.filter()', 'Array.prototype.reduce()', 'Array.prototype.forEach()'],
    correctAnswerIndex: 1,
    explanation: 'filter() creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.',
    difficulty: QuestionDifficulty.EASY,
  },

  // -------------------------------------------------------------
  // PYTHON
  // -------------------------------------------------------------
  {
    skillName: 'Python',
    questionText: 'What is the difference between a list and a tuple in Python?',
    options: [
      'Lists can store numbers while tuples can only store strings',
      'Lists are mutable (elements can be modified), while tuples are immutable',
      'Tuples have higher memory overhead than lists',
      'Lists use parentheses () while tuples use brackets []',
    ],
    correctAnswerIndex: 1,
    explanation: 'In Python, lists are mutable objects defined with [], whereas tuples are immutable sequences defined with () whose contents cannot be altered once instantiated.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Python',
    questionText: 'What is the Global Interpreter Lock (GIL) in CPython?',
    options: [
      'A security module that encrypts Python source code',
      'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously',
      'A database transaction lock used by SQLite in Python',
      'A lock that prevents modification of built-in functions',
    ],
    correctAnswerIndex: 1,
    explanation: 'The GIL is a mutex used by CPython to prevent race conditions in its reference-counting memory management, restricting execution of Python bytecode to one thread at a time per process.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Python',
    questionText: 'What is a Python generator and how is it defined?',
    options: [
      'A class that generates random numbers using math.random',
      'A function that yields values lazily one at a time using the yield keyword, maintaining state between calls without building a full list in memory',
      'A C extension module that creates new Python syntax',
      'A decorator that runs code asynchronously in asyncio',
    ],
    correctAnswerIndex: 1,
    explanation: 'Generators use the yield keyword to produce items on demand. They provide high memory efficiency when iterating over large datasets.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Python',
    questionText: 'What is the output of the following list comprehension?',
    codeSnippet: `nums = [1, 2, 3, 4, 5]
evens = [x * 2 for x in nums if x % 2 == 0]
print(evens)`,
    options: ['[2, 4]', '[4, 8]', '[2, 4, 6, 8, 10]', '[4, 6, 8]'],
    correctAnswerIndex: 1,
    explanation: 'nums has even numbers 2 and 4. The expression multiplies each by 2, yielding [2*2, 4*2] = [4, 8].',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Python',
    questionText: 'What is the purpose of Python *args and **kwargs in function definitions?',
    options: [
      'To enforce strict data types on arguments',
      '*args accepts a variable number of positional arguments as a tuple, while **kwargs accepts variable keyword arguments as a dictionary',
      'To assign default integer and string values to parameters',
      'To declare pointer addresses in memory like C',
    ],
    correctAnswerIndex: 1,
    explanation: '*args collects excess positional arguments into a tuple, and **kwargs collects excess keyword arguments into a dictionary.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Python',
    questionText: 'What does the with statement (Context Manager) guarantee in Python?',
    options: [
      'Parallel thread execution',
      'Automatic setup and teardown cleanup (such as calling file.close() or releasing locks), even if exceptions occur',
      'Type checking before function execution',
      'Automatic serialization to JSON',
    ],
    correctAnswerIndex: 1,
    explanation: 'Context managers implement __enter__ and __exit__ methods to guarantee that resources are properly closed or cleaned up even if unhandled exceptions are raised.',
    difficulty: QuestionDifficulty.EASY,
  },

  // -------------------------------------------------------------
  // SQL
  // -------------------------------------------------------------
  {
    skillName: 'SQL',
    questionText: 'What is the difference between WHERE and HAVING clauses in SQL?',
    options: [
      'WHERE filters rows before aggregation, while HAVING filters aggregated groups after GROUP BY',
      'WHERE can only be used with SELECT while HAVING is used with UPDATE',
      'HAVING is faster than WHERE on indexed columns',
      'There is no functional difference; they are interchangeable',
    ],
    correctAnswerIndex: 0,
    explanation: 'WHERE filters individual records before groups are formed. HAVING filters summarized groups after the GROUP BY clause and can evaluate aggregate functions like COUNT(), SUM(), AVG().',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'SQL',
    questionText: 'What will be returned by a LEFT OUTER JOIN between Table A and Table B?',
    options: [
      'Only the rows that have matching keys in both tables',
      'All rows from Table A, along with matching rows from Table B, filling with NULL where there is no match',
      'All rows from Table B, along with matching rows from Table A',
      'The Cartesian product (cross join) of both tables',
    ],
    correctAnswerIndex: 1,
    explanation: 'A LEFT JOIN returns all records from the left table (A), and matched records from the right table (B). If there is no match, the right side contains NULL.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'SQL',
    questionText: 'What are ACID properties in database management systems?',
    options: [
      'Access, Control, Integrity, Durability',
      'Atomicity, Consistency, Isolation, Durability',
      'Asynchronous, Concurrent, Isolated, Distributed',
      'Authentication, Cryptography, Indexing, Decryption',
    ],
    correctAnswerIndex: 1,
    explanation: 'ACID guarantees transaction reliability: Atomicity (all-or-nothing), Consistency (rules preserved), Isolation (concurrent execution without conflict), and Durability (committed changes persist).',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'SQL',
    questionText: 'Which SQL statement prevents duplicate rows from appearing in the final result set?',
    options: ['SELECT UNIQUE', 'SELECT DISTINCT', 'SELECT NO_DUPLICATES', 'SELECT FILTERED'],
    correctAnswerIndex: 1,
    explanation: 'SELECT DISTINCT filters out duplicate rows so that each returned row is distinct.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'SQL',
    questionText: 'What is the primary benefit of creating a B-Tree index on a frequently queried SQL column?',
    options: [
      'Reduces the disk storage size of the table by 50%',
      'Speeds up row lookups from $O(N)$ full table scans to $O(\\log N)$ tree searches for equality and range queries',
      'Guarantees foreign key constraints are not violated',
      'Automatically normalizes the database table into 3NF',
    ],
    correctAnswerIndex: 1,
    explanation: 'B-Tree indexes structure column keys in balanced trees, drastically reducing the number of disk I/O operations required to locate target records from linear scans to logarithmic lookups.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'SQL',
    questionText: 'What is a SQL Injection vulnerability and how is it primarily prevented?',
    options: [
      'A hardware error prevented by installing ECC RAM',
      'Malicious SQL commands injected via untrusted user input, prevented by using Parameterized Queries / Prepared Statements (or ORMs)',
      'An index corruption prevented by running VACUUM ANALYZE',
      'A dead lock condition prevented by increasing connection pool size',
    ],
    correctAnswerIndex: 1,
    explanation: 'SQL injection happens when untrusted user input is directly concatenated into SQL statements. Parameterized queries ensure user input is treated strictly as literal data, never executable code.',
    difficulty: QuestionDifficulty.EASY,
  },

  // -------------------------------------------------------------
  // DOCKER & DEVOPS
  // -------------------------------------------------------------
  {
    skillName: 'Docker',
    questionText: 'What is the primary difference between a Docker Image and a Docker Container?',
    options: [
      'Images run in memory while containers are stored on hard disks',
      'An image is an immutable read-only blueprint/template, while a container is a running, writable instance of that image',
      'Images are for Linux while containers are for Windows',
      'Containers can only run Python code while images run any binary',
    ],
    correctAnswerIndex: 1,
    explanation: 'A Docker image is a packaged, static snapshot containing application code, libraries, and runtime dependencies. A container is an active running instance of that image.',
    difficulty: QuestionDifficulty.EASY,
  },
  {
    skillName: 'Docker',
    questionText: 'In a Dockerfile, what is the key difference between RUN and CMD instructions?',
    options: [
      'RUN executes at build time to install packages and create layers; CMD specifies the default executable command run when the container starts',
      'RUN is for production; CMD is for development',
      'CMD runs during docker build; RUN runs during docker run',
      'There is no difference; CMD is an older alias for RUN',
    ],
    correctAnswerIndex: 0,
    explanation: 'RUN executes commands in a new layer and commits the results during container image build time. CMD specifies the command that executes when the container is actually launched.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
  {
    skillName: 'Docker',
    questionText: 'What is a multi-stage Docker build used for?',
    options: [
      'To run containers on multiple operating systems at the exact same moment',
      'To use separate build stages so heavy build tools and compilers can be discarded, yielding a minimal, secure production image',
      'To divide database tables across multiple volumes',
      'To speed up CPU clock speed during container initialization',
    ],
    correctAnswerIndex: 1,
    explanation: 'Multi-stage builds allow developers to use intermediate containers with compilers and build tools to produce binaries/bundles, and then copy only the production artifacts into a slim base image.',
    difficulty: QuestionDifficulty.MEDIUM,
  },
];

export async function seedFactualQuestions() {
  console.log('🌱 Seeding factual assessment questions...');

  let createdCount = 0;

  for (const q of FACTUAL_QUESTIONS) {
    const skill = await prisma.skill.findUnique({
      where: { name: q.skillName },
    });

    if (!skill) {
      console.warn(`⚠️ Skill not found: ${q.skillName}, skipping question`);
      continue;
    }

    // Check if question already exists by text and skill
    const existing = await prisma.quizQuestion.findFirst({
      where: {
        skillId: skill.id,
        questionText: q.questionText,
      },
    });

    if (!existing) {
      await prisma.quizQuestion.create({
        data: {
          skillId: skill.id,
          questionText: q.questionText,
          codeSnippet: q.codeSnippet || null,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          status: QuestionStatus.APPROVED,
          isAiGenerated: false,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Seeded ${createdCount} authentic technical quiz questions into database.`);
}

if (require.main === module) {
  seedFactualQuestions()
    .catch((err) => {
      console.error('❌ Question seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
