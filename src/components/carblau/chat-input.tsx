"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export interface ChatInputHandle {
  focus: () => void;
  setText: (text: string) => void;
}

const formSchema = z.object({
  message: z.string().trim().min(1, "Escribe un mensaje."),
});

type FormData = z.infer<typeof formSchema>;

// Caja de texto flotante: una píldora con el fondo desenfocado detrás, sobre
// la conversación. El foco se señala en el borde de la píldora, no en el área.
export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSubmit, isLoading, placeholder = "Escribe tu respuesta…" }, ref) => {
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
      // Devuelve un mensaje no enviado (error de red/backend) a la caja de texto
      setText: (text: string) => {
        form.setValue("message", text, { shouldValidate: true });
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
      if (event.key === "Enter" && !event.shiftKey && !isLoading) {
        event.preventDefault();
        form.handleSubmit(handleFormSubmit)();
      }
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="flex w-full items-end gap-1.5 rounded-[30px] border border-cb-crema/[0.16] bg-cb-espresso-2/80 p-1.5 pl-3 shadow-[0_12px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-colors focus-within:border-cb-agua/70"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => {
              // Extraemos 'onChange' para poder interceptarlo
              const { ref: fieldRef, onChange, ...restOfField } = field;

              return (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Textarea
                      ref={(e) => {
                        fieldRef(e);
                        textareaRef.current = e;
                      }}
                      aria-label="Tu mensaje"
                      placeholder={placeholder}
                      rows={1}
                      maxLength={1000}  // mismo límite que el backend (MAX_CARACTERES_MENSAJE)
                      enterKeyHint="send"
                      className="min-h-[44px] max-h-[120px] resize-none overflow-y-auto rounded-none border-0 bg-transparent px-2 py-[11px] text-base text-cb-crema shadow-none placeholder:text-cb-crema-tenue focus-visible:ring-0 focus-visible:ring-offset-0 cb-scroll"
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

          <button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            aria-label="Enviar"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cb-agua text-cb-navy transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-crema disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </form>
      </Form>
    );
  }
);

ChatInput.displayName = "ChatInput";
