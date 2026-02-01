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
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
        event.preventDefault();
        form.handleSubmit(handleFormSubmit)();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-end gap-3">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => {
              const { ref: fieldRef, ...restOfField } = field;

              return (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      ref={(e) => {
                        fieldRef(e);
                        textareaRef.current = e;
                      }}
                      placeholder="Cada detalle nos acerca tu coche ideal..."
                      rows={1}
                      // 🎨 ESTILOS NUEVOS:
                      // bg-white: Fondo blanco limpio.
                      // text-slate-900: Texto oscuro.
                      // rounded-2xl: Bordes muy redondeados (estilo cápsula).
                      // focus-visible:ring-[#082144]: El anillo de enfoque es tu azul corporativo.
                      className="resize-none min-h-[50px] py-3 px-4 bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 shadow-sm rounded-2xl focus-visible:ring-[#082144]"
                      {...restOfField}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          
          {/* 🎨 BOTÓN DE ENVIAR */}
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !form.formState.isValid}
            // Estilo: Azul oscuro (#082144), redondo, sombra y transición suave.
            className="h-[50px] w-[50px] rounded-full bg-[#082144] hover:bg-[#082144]/90 text-white shadow-md transition-all shrink-0"
          >
            <SendHorizonal className="h-5 w-5 ml-0.5" /> {/* ml-0.5 para centrar visualmente el icono */}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </Form>
    );
  }
);

ChatInput.displayName = 'ChatInput';