import { jsonError, readJson, validationError } from "@/lib/apiResponses";
import {
  scheduleGenerateSchema,
  type GeneratedScheduleDay,
  type GeneratedScheduleItem,
} from "@/lib/scheduleSchemas";
import { prisma } from "@/lib/prisma";

const priorityRank: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getSchedulableDates(
  startDate: string,
  endDate: string,
  excludedWeekdays: number[],
) {
  const excluded = new Set(excludedWeekdays);
  const dates: Date[] = [];

  for (
    let currentDate = parseDate(startDate);
    currentDate <= parseDate(endDate);
    currentDate = addDays(currentDate, 1)
  ) {
    if (!excluded.has(currentDate.getUTCDay())) {
      dates.push(currentDate);
    }
  }

  return dates;
}

function groupSchedule(items: GeneratedScheduleItem[]) {
  const grouped = new Map<string, GeneratedScheduleDay>();

  for (const item of items) {
    const currentDay = grouped.get(item.date) ?? {
      date: item.date,
      totalPlannedMinutes: 0,
      sessions: [],
    };

    currentDay.totalPlannedMinutes += item.plannedMinutes;
    currentDay.sessions.push(item);
    grouped.set(item.date, currentDay);
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export async function POST(request: Request) {
  const body = await readJson(request);

  if (body.error) {
    return body.error;
  }

  const result = scheduleGenerateSchema.safeParse(body.data);

  if (!result.success) {
    return validationError(result.error);
  }

  const { availableMinutesPerDay, startDate, endDate, excludedWeekdays } =
    result.data;
  const schedulableDates = getSchedulableDates(
    startDate,
    endDate,
    excludedWeekdays,
  );

  if (schedulableDates.length === 0) {
    return jsonError("No available schedule days in the selected range.", 400);
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: {
          in: ["BACKLOG", "TODAY"],
        },
      },
      include: {
        studySessions: true,
      },
    });

    const sortedTasks = tasks
      .map((task) => {
        const alreadyPlannedMinutes = task.studySessions.reduce(
          (minutes, session) => minutes + session.plannedMinutes,
          0,
        );

        return {
          ...task,
          remainingMinutes: Math.max(
            task.estimatedMinutes - alreadyPlannedMinutes,
            0,
          ),
        };
      })
      .filter((task) => task.remainingMinutes > 0)
      .sort((a, b) => {
        const priorityComparison =
          (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);

        if (priorityComparison !== 0) {
          return priorityComparison;
        }

        return a.deadline.getTime() - b.deadline.getTime();
      });

    const remainingCapacityByDate = new Map(
      schedulableDates.map((date) => [formatDate(date), availableMinutesPerDay]),
    );
    const createdItems: GeneratedScheduleItem[] = [];
    const unscheduledTasks: Array<{
      taskId: string;
      title: string;
      remainingMinutes: number;
    }> = [];

    await prisma.$transaction(async (transaction) => {
      for (const task of sortedTasks) {
        let remainingTaskMinutes = task.remainingMinutes;

        for (const date of schedulableDates) {
          if (remainingTaskMinutes <= 0) {
            break;
          }

          const dateKey = formatDate(date);
          const remainingDayCapacity = remainingCapacityByDate.get(dateKey) ?? 0;

          if (remainingDayCapacity <= 0) {
            continue;
          }

          const plannedMinutes = Math.min(
            remainingTaskMinutes,
            remainingDayCapacity,
          );

          const session = await transaction.studySession.create({
            data: {
              taskId: task.id,
              date,
              plannedMinutes,
            },
            include: {
              task: true,
            },
          });

          createdItems.push({
            id: session.id,
            taskId: session.taskId,
            taskTitle: session.task.title,
            taskPriority: session.task.priority,
            date: dateKey,
            plannedMinutes: session.plannedMinutes,
          });

          remainingTaskMinutes -= plannedMinutes;
          remainingCapacityByDate.set(
            dateKey,
            remainingDayCapacity - plannedMinutes,
          );
        }

        if (remainingTaskMinutes > 0) {
          unscheduledTasks.push({
            taskId: task.id,
            title: task.title,
            remainingMinutes: remainingTaskMinutes,
          });
        }
      }
    });

    return Response.json({
      schedule: groupSchedule(createdItems),
      unscheduledTasks,
    });
  } catch {
    return jsonError("Failed to generate schedule.", 500);
  }
}
