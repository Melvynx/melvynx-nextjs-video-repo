import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentProps } from "react";
import { useFieldContext } from "./tanstack-form";

export function InputField({
  label,
  ...inputProps
}: { label: string } & ComponentProps<typeof Input>) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  const error = field.state.meta.errors.map((e) => e.message).join(", ");

  const { isTouched, isPristine, isDirty, isBlurred, isValidating } =
    field.state.meta;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        {...inputProps}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={!!error}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <pre>
        {JSON.stringify(
          { isTouched, isPristine, isDirty, isBlurred, isValidating },
          null,
          2
        )}
      </pre>
    </div>
  );
}
