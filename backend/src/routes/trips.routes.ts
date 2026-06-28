import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getUserTrips,          // GET (/api/trips) - список поездок пользователя
  createTripHandler,     // POST (/api/trips) - создание новой поездки
  getTripByIdHandler,    // GET (/api/trips/:id) - детали одной поездки
  updateTripHandler,     // PUT (/api/trips/:id) - обновление поездки
  deleteTripHandler,     // DELETE (/api/trips/:id) - удаление поездки
} from "../controllers/trip.controller";

import {
  createEventHandler,
  getEventsHandler,
  updateEventHandler,
  deleteEventHandler,
} from "../controllers/event.controller";

// Экземпляр роутера для группировки маршрутов поездок
const router = Router();

// Все маршруты требуют JWT-авторизацию
router.use(authMiddleware);

router.get("/", getUserTrips);              // GET /api/trips?status=active
router.post("/", createTripHandler);        // POST /api/trips
router.get("/:id", getTripByIdHandler);     // GET /api/trips/:id
router.put("/:id", updateTripHandler);      // PUT /api/trips/:id
router.delete("/:id", deleteTripHandler);   // DELETE /api/trips/:id

// Маршруты для событий
router.post("/:tripId/events", createEventHandler)        // POST /api/trips/:tripId/events
router.get("/:tripId/events", getEventsHandler);          // GET /api/trips/:tripId/events
router.put("/events/:eventId", updateEventHandler);       // PUT /api/trips/events/:eventId
router.delete("/events/:eventId", deleteEventHandler);    // DELETE /api/trips/events/:eventId

export default router; // Экспорт для подключения в app.ts с префиксом /api/trips