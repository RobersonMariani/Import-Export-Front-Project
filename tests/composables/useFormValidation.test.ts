import { describe, it, expect } from "vitest";
import { z } from "zod";
import { useFormValidation } from "@/composables/useFormValidation";

const testSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
});

describe("useFormValidation", () => {
  it("validates all fields successfully", () => {
    const { validateAll, errors } = useFormValidation(testSchema);
    const result = validateAll({ name: "John", email: "john@test.com" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "John", email: "john@test.com" });
    expect(Object.keys(errors.value)).toHaveLength(0);
  });

  it("reports validation errors", () => {
    const { validateAll, errors } = useFormValidation(testSchema);
    const result = validateAll({ name: "", email: "invalid" });

    expect(result.success).toBe(false);
    expect(errors.value.name).toBe("Nome obrigatório");
    expect(errors.value.email).toBe("E-mail inválido");
  });

  it("sets API errors", () => {
    const { setApiErrors, errors } = useFormValidation(testSchema);
    setApiErrors({ email: ["E-mail já cadastrado"] });

    expect(errors.value.email).toBe("E-mail já cadastrado");
  });

  it("clears errors", () => {
    const { validateAll, clearErrors, errors } = useFormValidation(testSchema);
    validateAll({ name: "", email: "" });
    expect(Object.keys(errors.value).length).toBeGreaterThan(0);

    clearErrors();
    expect(Object.keys(errors.value)).toHaveLength(0);
  });
});
