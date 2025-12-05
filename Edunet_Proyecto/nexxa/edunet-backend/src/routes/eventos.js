"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventosController_1 = require("../controllers/eventosController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const eventosController = new eventosController_1.EventosController();
router.use(auth_1.authMiddleware);
router.get('/', eventosController.getEventos);
// Solo admin (y quizás profesor) pueden gestionar eventos
router.post('/', (0, authorize_1.authorize)('administrador', 'profesor'), eventosController.createEvento);
router.delete('/:idEvento', (0, authorize_1.authorize)('administrador', 'profesor'), eventosController.deleteEvento);
exports.default = router;
