import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { ComponentProps } from "react";
import { useFormContext } from "./tanstack-form";

export function SubmitButton(props: ComponentProps<typeof Button>) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button disabled={isSubmitting} {...props}>
          {isSubmitting ? (
            <Loader className="animate-spin size-4" />
          ) : (
            props.children
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}
