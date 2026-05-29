import { Request, Response, NextFunction } from "express"
import { OccurrenceStatus } from "@prisma/client"
import { prisma } from "../config/prisma"

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalOccurrences,
      openCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      byCategory,
      recentOccurrences,
      totalUsers,
      totalAdmins,
    ] = await prisma.$transaction([
      prisma.occurrence.count(),
      prisma.occurrence.count({ where: { status: OccurrenceStatus.OPEN } }),
      prisma.occurrence.count({ where: { status: OccurrenceStatus.UNDER_REVIEW } }),
      prisma.occurrence.count({ where: { status: OccurrenceStatus.IN_PROGRESS } }),
      prisma.occurrence.count({ where: { status: OccurrenceStatus.RESOLVED } }),
      prisma.occurrence.count({ where: { status: OccurrenceStatus.REJECTED } }),
      prisma.occurrence.groupBy({
        by: ["category"],
        _count: { id: true },
        orderBy: { category: "asc" },
      }),
      prisma.occurrence.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ])

    res.json({
      summary: {
        total: totalOccurrences,
        open: openCount,
        underReview: underReviewCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        resolutionRate:
          totalOccurrences > 0
            ? Math.round((resolvedCount / totalOccurrences) * 100)
            : 0,
        totalUsers,
        totalCitizens: totalUsers - totalAdmins,
        totalAdmins,
      },
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: (item._count as { id: number }).id,
      })),
      recentOccurrences,
    })
  } catch (err) {
    next(err)
  }
}

export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = req.query
    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      }),
    }
    const occurrences = await prisma.occurrence.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { changedBy: { select: { name: true } } },
        },
      },
    })
    res.json({ total: occurrences.length, data: occurrences })
  } catch (err) {
    next(err)
  }
}
