import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Metadata } from "@superstreamer/player/react";

type PlayerMetadataFormProps = {
  values: Metadata;
  onSubmit(metadata: Metadata): void;
};
export function PlayerMetadataForm({
  values,
  onSubmit,
}: PlayerMetadataFormProps) {
  const form = useForm<Metadata>({
    values,
  });

  const onChange = form.handleSubmit((values: Metadata) => {
    onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onChange={onChange} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Displays a title in the controls.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Adds a subtitle to the title.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
