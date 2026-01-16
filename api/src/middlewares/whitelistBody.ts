import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/lib/api_response/error';


export const whitelistBody = (allowedFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>;
    
    const receivedFields = Object.keys(body);
    
    const unauthorizedFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unauthorizedFields.length > 0) {
      const errors = unauthorizedFields.reduce((acc, field) => {
        acc[field] = {
          msg: `Field '${field}' is not allowed`,
          value: body[field],
          location: 'body',
        };
        return acc;
      }, {} as Record<string, unknown>);

      throw new ValidationError('Invalid fields detected', errors);
    }

    next();
  };
};

export default whitelistBody;