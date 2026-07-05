import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.reattemptPermission.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@quizme.com',
      password: adminPasswordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user@quizme.com',
      password: userPasswordHash,
      name: 'John Doe',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@quizme.com',
      password: userPasswordHash,
      name: 'Jane Smith',
      role: Role.USER,
    },
  });

  console.log('Created users:', { admin: admin.email, user1: user1.email, user2: user2.email });

  // Create Quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Web Development Basics',
      description: 'Test your basic knowledge of HTML, CSS, and JavaScript.',
      timeLimitMins: 15,
      passingPercent: 80,
      isPublished: true,
      randomize: true,
      questions: {
        create: [
          {
            text: 'Which HTML element is used to define the title of a document?',
            optionA: '<meta>',
            optionB: '<title>',
            optionC: '<head>',
            optionD: '<header>',
            correctAnswer: 'B',
            order: 1,
          },
          {
            text: 'Which CSS property is used to change the text color of an element?',
            optionA: 'color',
            optionB: 'text-color',
            optionC: 'font-color',
            optionD: 'foreground-color',
            correctAnswer: 'A',
            order: 2,
          },
          {
            text: 'What is the correct syntax for referring to an external script named "xxx.js"?',
            optionA: '<script href="xxx.js">',
            optionB: '<script name="xxx.js">',
            optionC: '<script src="xxx.js">',
            optionD: '<script file="xxx.js">',
            correctAnswer: 'C',
            order: 3,
          },
          {
            text: 'How do you write "Hello World" in an alert box in JavaScript?',
            optionA: 'msg("Hello World");',
            optionB: 'alertBox("Hello World");',
            optionC: 'msgBox("Hello World");',
            optionD: 'alert("Hello World");',
            correctAnswer: 'D',
            order: 4,
          },
          {
            text: 'Which HTML element is used for the largest heading?',
            optionA: '<heading>',
            optionB: '<h6>',
            optionC: '<h1>',
            optionD: '<head>',
            correctAnswer: 'C',
            order: 5,
          },
        ],
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Advanced Cloud Architecture',
      description: 'Test your understanding of cloud-native systems, scaling, microservices, and load balancing.',
      timeLimitMins: 30,
      passingPercent: 85,
      isPublished: true,
      randomize: true,
      questions: {
        create: [
          {
            text: 'Which cloud computing service model provides hardware, networking, and virtualization services?',
            optionA: 'SaaS',
            optionB: 'PaaS',
            optionC: 'IaaS',
            optionD: 'FaaS',
            correctAnswer: 'C',
            order: 1,
          },
          {
            text: 'What is the primary benefit of deploying applications across multiple Availability Zones?',
            optionA: 'Reduced latency for all global users',
            optionB: 'High availability and fault tolerance',
            optionC: 'Lower cost of compute resources',
            optionD: 'Simpler security group configurations',
            correctAnswer: 'B',
            order: 2,
          },
          {
            text: 'Which load balancing method distributes traffic sequentially to servers in a pool?',
            optionA: 'Least Connections',
            optionB: 'Weighted Round Robin',
            optionC: 'Round Robin',
            optionD: 'IP Hash',
            correctAnswer: 'C',
            order: 3,
          },
          {
            text: 'What does the "C" in CAP theorem stand for?',
            optionA: 'Consistency',
            optionB: 'Concurrency',
            optionC: 'Capacity',
            optionD: 'Caching',
            correctAnswer: 'A',
            order: 4,
          },
          {
            text: 'In cloud environments, what is "horizontal scaling"?',
            optionA: 'Upgrading a server to a larger size with more RAM and CPU',
            optionB: 'Adding more instances of a resource to distribute the load',
            optionC: 'Moving computing tasks to a server in a different geographical region',
            optionD: 'Decreasing resource capacities during low-traffic hours',
            correctAnswer: 'B',
            order: 5,
          },
        ],
      },
    },
  });

  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Quantum Mechanics 101',
      description: 'An introductory quiz on the fundamentals of quantum physics and wave mechanics.',
      timeLimitMins: 45,
      passingPercent: 70,
      isPublished: true,
      randomize: true,
      questions: {
        create: [
          {
            text: 'Which physicist proposed the wave-particle duality of matter?',
            optionA: 'Albert Einstein',
            optionB: 'Louis de Broglie',
            optionC: 'Werner Heisenberg',
            optionD: 'Erwin Schrödinger',
            correctAnswer: 'B',
            order: 1,
          },
          {
            text: 'What principle states that it is impossible to simultaneously measure a particle\'s position and momentum with absolute precision?',
            optionA: 'Schrödinger equation',
            optionB: 'Pauli exclusion principle',
            optionC: 'Heisenberg uncertainty principle',
            optionD: 'Planck\'s law',
            correctAnswer: 'C',
            order: 2,
          },
          {
            text: 'What quantum physics concept refers to a state where two or more particles are linked together so that the state of one instantly influences the other, regardless of distance?',
            optionA: 'Quantum Superposition',
            optionB: 'Quantum Entanglement',
            optionC: 'Quantum Tunneling',
            optionD: 'Quantum Coherence',
            correctAnswer: 'B',
            order: 3,
          },
          {
            text: 'What is the physical significance of the square of the absolute value of the wave function, |Ψ|²?',
            optionA: 'Probability density of finding a particle at a given point',
            optionB: 'Energy level of the particle',
            optionC: 'Velocity of the wave propagation',
            optionD: 'Momentum of the particle',
            correctAnswer: 'A',
            order: 4,
          },
          {
            text: 'What are the basic units of quantum information?',
            optionA: 'Bits',
            optionB: 'Bytes',
            optionC: 'Qubits',
            optionD: 'Qubytes',
            correctAnswer: 'C',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('Created quizzes:', {
    quiz1: quiz1.title,
    quiz2: quiz2.title,
    quiz3: quiz3.title,
  });

  // Seed sample Quiz Attempts to make dashboard/leaderboard interesting
  await prisma.quizAttempt.create({
    data: {
      userId: user1.id,
      quizId: quiz1.id,
      score: 100,
      totalCorrect: 5,
      totalQuestions: 5,
      answers: JSON.stringify({
        [quiz1.questions[0]?.id || '1']: 'B',
        [quiz1.questions[1]?.id || '2']: 'A',
        [quiz1.questions[2]?.id || '3']: 'C',
        [quiz1.questions[3]?.id || '4']: 'D',
        [quiz1.questions[4]?.id || '5']: 'C',
      }),
      timeTakenSecs: 252, // 4 mins 12s
      isReattempt: false,
      completedAt: new Date(),
    },
  });

  await prisma.quizAttempt.create({
    data: {
      userId: user2.id,
      quizId: quiz1.id,
      score: 80,
      totalCorrect: 4,
      totalQuestions: 5,
      answers: JSON.stringify({
        [quiz1.questions[0]?.id || '1']: 'B',
        [quiz1.questions[1]?.id || '2']: 'A',
        [quiz1.questions[2]?.id || '3']: 'C',
        [quiz1.questions[3]?.id || '4']: 'D',
        [quiz1.questions[4]?.id || '5']: 'A', // wrong
      }),
      timeTakenSecs: 285, // 4 mins 45s
      isReattempt: false,
      completedAt: new Date(),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
