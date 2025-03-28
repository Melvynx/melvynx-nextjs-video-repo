import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { InputField } from "./input-field";
import { SubmitButton } from "./submit-button";
import { TextareaField } from "./textarea-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// Allow us to bind components to the form to keep type safety but reduce production boilerplate
// Define this once to have a generator of consistent form instances throughout your app
export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: InputField,
    Textarea: TextareaField,
  },
  formComponents: {
    SubmitButton: SubmitButton,
  },
  fieldContext,
  formContext,
});
