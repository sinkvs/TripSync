import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getUserTrips,
  createTripHandler,
  getTripByIdHandler,
  updateTripHandler,
  deleteTripHandler,
  removeMemberHandler,
} from "../controllers/trip.controller";

import {
  createEventHandler,
  getEventsHandler,
  updateEventHandler,
  deleteEventHandler,
} from "../controllers/event.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserTrips);
router.post("/", createTripHandler);
router.get("/:id", getTripByIdHandler);
router.put("/:id", updateTripHandler);
router.delete("/:id", deleteTripHandler);

router.post("/:tripId/events", createEventHandler);
router.get("/:tripId/events", getEventsHandler);
router.put("/events/:eventId", updateEventHandler);
router.delete("/events/:eventId", deleteEventHandler);

router.delete("/:tripId/members/:userId", removeMemberHandler);

export default router;