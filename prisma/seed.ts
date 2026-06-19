import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import type { TaskPriority, TaskStatus } from "../src/types/task";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl,
  }),
});

type DemoTask = {
  id: string;
  title: string;
  description: string;
  deadlineOffsetDays: number;
  estimatedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
};

type DemoSession = {
  taskId: string;
  dayOffset: number;
  plannedMinutes: number;
  completedMinutes?: number;
  notes?: string;
};

const demoTasks: DemoTask[] = [
  {
    id: "demo-task-math-review",
    title: "Review algebra foundations",
    description: "Work through equations, inequalities, and factoring drills before the exam.",
    deadlineOffsetDays: 5,
    estimatedMinutes: 180,
    priority: "HIGH",
    status: "TODAY",
  },
  {
    id: "demo-task-history-outline",
    title: "Draft history essay outline",
    description: "Turn source notes into a thesis, three supporting arguments, and citations.",
    deadlineOffsetDays: 8,
    estimatedMinutes: 120,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  },
  {
    id: "demo-task-lab-report",
    title: "Finalize chemistry lab report",
    description: "Clean up observations, add the results table, and write the conclusion.",
    deadlineOffsetDays: 2,
    estimatedMinutes: 90,
    priority: "HIGH",
    status: "IN_PROGRESS",
  },
  {
    id: "demo-task-reading",
    title: "Read product strategy chapter",
    description: "Summarize the chapter and capture three ideas to discuss in class.",
    deadlineOffsetDays: 12,
    estimatedMinutes: 60,
    priority: "LOW",
    status: "BACKLOG",
  },
  {
    id: "demo-task-flashcards",
    title: "Create biology flashcards",
    description: "Convert the cell structure notes into quick review cards.",
    deadlineOffsetDays: 4,
    estimatedMinutes: 75,
    priority: "MEDIUM",
    status: "TODAY",
  },
  {
    id: "demo-task-weekly-review",
    title: "Complete weekly planning review",
    description: "Compare planned study time with actual progress and adjust next week.",
    deadlineOffsetDays: -1,
    estimatedMinutes: 45,
    priority: "LOW",
    status: "DONE",
  },
];

const demoSessions: DemoSession[] = [
  {
    taskId: "demo-task-math-review",
    dayOffset: 0,
    plannedMinutes: 60,
    completedMinutes: 45,
    notes: "Finished equations, need more time on factoring.",
  },
  {
    taskId: "demo-task-math-review",
    dayOffset: 2,
    plannedMinutes: 60,
  },
  {
    taskId: "demo-task-history-outline",
    dayOffset: 1,
    plannedMinutes: 45,
    completedMinutes: 45,
    notes: "Thesis and first two arguments are drafted.",
  },
  {
    taskId: "demo-task-lab-report",
    dayOffset: 3,
    plannedMinutes: 90,
  },
  {
    taskId: "demo-task-flashcards",
    dayOffset: 4,
    plannedMinutes: 30,
    completedMinutes: 20,
    notes: "Definitions are done; diagrams still need cards.",
  },
  {
    taskId: "demo-task-weekly-review",
    dayOffset: -1,
    plannedMinutes: 45,
    completedMinutes: 45,
    notes: "Reviewed the week and marked completed items.",
  },
];

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = addDays(today, -daysSinceMonday);
  monday.setHours(9, 0, 0, 0);
  return monday;
}

async function main() {
  const today = new Date();
  const weekStart = startOfCurrentWeek();
  const demoTaskIds = demoTasks.map((task) => task.id);

  await prisma.studySession.deleteMany({
    where: {
      taskId: {
        in: demoTaskIds,
      },
    },
  });

  for (const task of demoTasks) {
    const taskData = {
      title: task.title,
      description: task.description,
      deadline: addDays(today, task.deadlineOffsetDays),
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      status: task.status,
    };

    await prisma.task.upsert({
      where: {
        id: task.id,
      },
      update: taskData,
      create: {
        id: task.id,
        ...taskData,
      },
    });
  }

  await prisma.studySession.createMany({
    data: demoSessions.map((session) => ({
      taskId: session.taskId,
      date: addDays(weekStart, session.dayOffset),
      plannedMinutes: session.plannedMinutes,
      completedMinutes: session.completedMinutes,
      notes: session.notes,
    })),
  });

  console.log(
    `Seeded ${demoTasks.length} demo tasks and ${demoSessions.length} study sessions.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed demo data.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
