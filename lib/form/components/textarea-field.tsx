import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComponentProps } from "react";
import { useFieldContext } from "./tanstack-form";

export function TextareaField({
  label,
  ...inputProps
}: { label: string } & ComponentProps<typeof Textarea>) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        {...inputProps}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
      />
    </div>
  );
}
