import { ref, type Ref } from "vue";
import type { ZodType, ZodError } from "zod";

export function useFormValidation<T extends Record<string, unknown>>(
  schema: ZodType<T>,
) {
  const errors: Ref<Partial<Record<keyof T, string>>> = ref({});

  function validateField(field: keyof T, value: unknown): boolean {
    try {
      const partial = { [field]: value } as T;
      schema.parse(partial);
      const current = { ...errors.value };
      delete current[field];
      errors.value = current;
      return true;
    } catch {
      return true;
    }
  }

  function validateAll(data: unknown): { success: boolean; data?: T } {
    try {
      const parsed = schema.parse(data);
      errors.value = {};
      return { success: true, data: parsed };
    } catch (err) {
      const zodError = err as ZodError;
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      for (const issue of zodError.issues) {
        const field = issue.path[0] as keyof T;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      errors.value = fieldErrors;
      return { success: false };
    }
  }

  function setApiErrors(apiErrors: Record<string, string[]>): void {
    const fieldErrors: Partial<Record<keyof T, string>> = {};
    for (const [field, messages] of Object.entries(apiErrors)) {
      fieldErrors[field as keyof T] = messages[0];
    }
    errors.value = fieldErrors;
  }

  function clearErrors(): void {
    errors.value = {};
  }

  return { errors, validateField, validateAll, setApiErrors, clearErrors };
}
