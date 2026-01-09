import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";
console.log("Healthcheck router loaded");
const healthcheckRouter = Router();

healthcheckRouter.route("/").get(healthcheck);
export default healthcheckRouter;
