"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

type FormData = z.infer<typeof formSchema>;

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        message: "",
      },
    });

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const handleFormSubmit: SubmitHandler<FormData> = (data) => {
      onSubmit(data.message);
      form.reset();
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => {
              // ✅ SOLUCIÓN: Destructuramos 'ref' para manejarlo manualmente
              // y evitamos el conflicto con el spread operator.
              const { ref: fieldRef, ...restOfField } = field;

              return (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      // ✅ Asignamos ambas referencias en el callback
                      ref={(e) => {
                        fieldRef(e); // 1. Asigna la ref para react-hook-form
                        textareaRef.current = e; // 2. Asigna nuestra ref local
                      }}
                      placeholder="Cada detalle nos acerca a tu coche ideal..."
                      rows={1}
                      className="resize-none pr-12"
                      // ✅ Usamos el resto de las propiedades del campo, ya sin 'ref'
                      {...restOfField}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !form.formState.isValid}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </Form>
    );
  }
);

ChatInput.displayName = 'ChatInput';
