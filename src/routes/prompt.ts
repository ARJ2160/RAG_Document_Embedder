import { Router } from "express";

import { generateResponse } from "../controllers/promptController";
import { validate } from "../middleware/validate";
import { generateResponseSchema } from "../schemas";

const router = Router();

router.post("/generate", validate(generateResponseSchema), generateResponse);

export default router;
