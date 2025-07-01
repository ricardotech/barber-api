import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export function validateBody(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors: ValidationError[] = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          return ['Validation failed'];
        }).flat();

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMessages
        });
      }

      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.query as object);
      const errors: ValidationError[] = await validate(dto as object);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          return ['Validation failed'];
        }).flat();

        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: errorMessages
        });
      }

      req.query = dto as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingParams = paramNames.filter(param => !req.params[param]);
    
    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        details: missingParams.map(param => `${param} is required`)
      });
    }

    next();
  };
}

export function validateUUID(paramName: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];
    
    if (!paramValue || !uuidRegex.test(paramValue)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName}`,
        details: [`${paramName} must be a valid UUID`]
      });
    }

    next();
  };
}