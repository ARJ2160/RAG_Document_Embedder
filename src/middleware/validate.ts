import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod";
import { AppError } from "./errorHandler";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      next(new AppError(`Validation error: ${error.errors[0].message}`, 400));
    }
  };
