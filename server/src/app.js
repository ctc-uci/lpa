import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import schedule from "node-schedule"; // TODO: Keep only if scheduling cronjobs

import { usersRouter } from "../routes/users";
import { commentsRouter } from '../routes/comments';
import { roomsRouter } from '../routes/rooms';
import { eventsRouter } from "../routes/events";
import { bookingsRouter } from "../routes/bookings";
import { assignmentsRouter } from "../routes/assignments";
import { verifyToken } from "./middleware";
import { clientsRouter } from "../routes/clients";
import { invoicesRouter } from "../routes/invoices";
import { programsRouter } from "../routes/programs";
import { invoicesAssignments } from "../routes/invoicesAssignments"
import { emailRouter } from "../routes/email";

dotenv.config();

// schedule.scheduleJob("0 0 0 0 0", () => console.info("Hello Cron Job!")); // TODO: delete sample cronjob

const CLIENT_HOSTNAME =
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_CLIENT_HOSTNAME}:${process.env.DEV_CLIENT_PORT}`
    : process.env.PROD_CLIENT_HOSTNAME;

const SERVER_PORT =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_SERVER_PORT
    : process.env.PROD_SERVER_PORT;

const app = express();
app.use(
  cors({
    origin: CLIENT_HOSTNAME,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === "production") {
  app.use(verifyToken);
}

app.use("/users", usersRouter);
app.use('/comments', commentsRouter);
app.use("/rooms", roomsRouter);
app.use("/bookings", bookingsRouter);
app.use("/events", eventsRouter);
app.use("/clients", clientsRouter);
app.use("/invoices", invoicesRouter);
app.use("/assignments", assignmentsRouter)
app.use("/programs", programsRouter);
app.use("/invoicesAssignments", invoicesAssignments)
app.use("/email", emailRouter)
app.listen(SERVER_PORT, () => {
  console.info(`Server listening on ${SERVER_PORT}`);
});

