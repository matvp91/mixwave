import { postTranscodeBodySchema } from "@mixwave/api/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export function IngestPage() {
  const form = useForm<z.infer<typeof postTranscodeBodySchema>>({
    resolver: zodResolver(postTranscodeBodySchema),
    defaultValues: {},
  });

  const onSubmit = (values: z.infer<typeof postTranscodeBodySchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="segmentSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>segmentSize</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>assetId</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
