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
      
      // Restauramos la altura a su tamaño original tras enviar el mensaje
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
        event.preventDefault();
        form.handleSubmit(handleFormSubmit)();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-end gap-3 w-full">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => {
              // Extraemos 'onChange' para poder interceptarlo
              const { ref: fieldRef, onChange, ...restOfField } = field;

              return (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      ref={(e) => {
                        fieldRef(e);
                        textareaRef.current = e;
                      }}
                      placeholder="Cada detalle nos acerca a tu coche..."
                      rows={1}
                      className="resize-none min-h-[50px] max-h-[120px] overflow-y-auto py-3 px-4 bg-white text-base text-slate-900 placeholder:text-slate-400 border-slate-200 shadow-sm rounded-2xl focus-visible:ring-[#082144] scrollbar-thin"
                      {...restOfField}
                      onChange={(e) => {
                        // 1. Actualizamos el estado del formulario de React Hook Form
                        onChange(e);
                        
                        // 2. Ajustamos la altura dinámicamente
                        const target = e.target;
                        target.style.height = "auto"; // Reseteamos primero
                        target.style.height = `${target.scrollHeight}px`; // Ajustamos al texto
                      }}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !form.formState.isValid}
            className="h-[50px] w-[50px] rounded-full bg-[#082144] hover:bg-[#082144]/90 text-white shadow-md transition-all shrink-0"
          >
            <SendHorizonal className="h-5 w-5 ml-0.5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </Form>
    );
  }
);

ChatInput.displayName = 'ChatInput';