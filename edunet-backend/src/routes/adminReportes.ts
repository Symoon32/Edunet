import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getUsersByRole,
    getTeacherAssignments,
    getCourseEnrollments,
    getActivityLog,
    getGradesByCourse,
    getStudentAttendance,
    getCourseAttendance
} from '../controllers/adminReportesController';

const router = Router();

// All routes in this file should be protected and only accessible by administrators.
router.use(authenticateToken, authorizeRoles(4));

router.get('/users-by-role/:idRol', getUsersByRole);
router.get('/teacher-assignments/:idProfesor', getTeacherAssignments);
router.get('/course-enrollments/:idCurso', getCourseEnrollments);
router.get('/activity-log', getActivityLog);

// Academic reports
router.get('/grades-by-course/:idCurso', getGradesByCourse);
router.get('/student-attendance/:idEstudiante', getStudentAttendance);
router.get('/course-attendance/:idCurso', getCourseAttendance);

export default router;
