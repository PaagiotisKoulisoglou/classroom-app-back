import express from 'express';
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
import { db } from "../db"

const router = express.Router();

router.get('/', async (_req , res) => {
    try{
        const query = _req.query as Record<string, any>;
        const search = query.search as string | undefined;
        const department = query.department as string | undefined;
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);

        const currentPage = Math.max(1, Number.isFinite(page) ? page : 1);
        const limitPerPage = Math.max(1, Number.isFinite(limit) ? limit : 10);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions: any[] = [];

        if (search) {
            filterConditions.push(or(
                ilike(subjects.name, `%${search}%`),
                ilike(subjects.code, `%${search}%`)
            ));
        }

        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined as any;


        const countResult = await db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)

        const totalCount = Number(countResult[0]?.count ?? 0);

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            department: { ...getTableColumns(departments) }
        })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .orderBy(desc(subjects.createdAt))
        .limit(limitPerPage)
        .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination:{
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })
    } catch (e) {
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({error: 'Failed to fetch subjects'});
    }

});

export default router;