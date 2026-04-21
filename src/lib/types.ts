export type FormApiResponse = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

