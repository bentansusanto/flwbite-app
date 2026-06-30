import { z } from "zod";

export const validateWithZod = <T>(schema: z.ZodSchema<T>) => {
  return (values: T) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formikErrors: any = {};
        for (const issue of error.issues) {
          let current = formikErrors;
          for (let i = 0; i < issue.path.length; i++) {
            const key = issue.path[i];
            const isLast = i === issue.path.length - 1;
            
            if (isLast) {
              current[key] = issue.message;
            } else {
              if (!current[key]) {
                const nextKey = issue.path[i + 1];
                current[key] = typeof nextKey === "number" ? [] : {};
              }
              current = current[key];
            }
          }
        }
        return formikErrors;
      }
      return {};
    }
  };
};
