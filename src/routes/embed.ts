import { Router } from "express";

import { embedDocuments } from "../controllers/embedController";
import { upload } from "../middleware/upload";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Handle document uploads
router.post("/embed", upload.array('documents', 10), (req, res, next) => {
  // Check for file validation errors from multer
  if ((req as any).fileValidationError) {
    return next(new AppError((req as any).fileValidationError, 400));
  }
  
  // If no files were uploaded
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return next(new AppError("No documents were uploaded", 400));
  }
  
  // Continue to the controller
  embedDocuments(req, res, next);
});

export default router;
