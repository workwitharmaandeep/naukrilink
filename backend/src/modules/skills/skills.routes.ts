import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// Public endpoint to get standard skills taxonomy
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category) {
      where.category = String(category);
    }
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ data: skills });
  } catch (error) {
    return next(error);
  }
});

export default router;
