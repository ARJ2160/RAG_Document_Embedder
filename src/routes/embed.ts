import { Router } from "express";

import { embedDocuments } from "../controllers/embedController";
import { validate } from "../middleware/validate";
import { embedDocumentSchema } from "../schemas";

const router = Router();

router.post("/embed", validate(embedDocumentSchema), embedDocuments);

export default router;
