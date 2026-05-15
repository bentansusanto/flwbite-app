import { z } from "zod";

export const validateWithZod = <T>(schema: z.ZodSchema<T>) => {
  return (values: T) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.flatten().fieldErrors;
      }
      return {};
    }
  };
};
