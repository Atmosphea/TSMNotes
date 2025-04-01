import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Send } from "lucide-react";

// Zod schema for form validation
const formSchema = z.object({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  offerAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

export type FormValues = z.infer<typeof formSchema>;

interface InquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FormValues) => void;
  noteListingId: number;
  buyerId: number;
  noteName: string;
  askingPrice: number;
  isLoading?: boolean;
}

export default function InquiryForm({
  isOpen,
  onClose,
  onSubmit,
  noteListingId,
  buyerId,
  noteName,
  askingPrice,
  isLoading = false,
}: InquiryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      offerAmount: undefined,
    },
  });

  // Mutation to send inquiry
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/inquiries", {
        buyerId,
        noteListingId,
        message: values.message,
        offerAmount: values.offerAmount,
        status: "pending",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/buyer/${buyerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/listing/${noteListingId}`] });
      
      // Show success toast
      toast({
        title: "Inquiry Sent",
        description: "Your inquiry has been sent to the seller. They'll respond soon.",
        variant: "default",
      });
      
      // Reset form and close dialog
      form.reset();
      onClose();
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Failed to Send",
        description: "There was an error sending your inquiry. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending inquiry:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmitForm = (values: FormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Inquiry for {noteName}
            </span>
          </DialogTitle>
          <DialogDescription>
            Send a message to the seller of this note. Include any questions about the property, note terms, or make an offer.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'm interested in this note. Could you provide more information about..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Introduce yourself and ask any specific questions about the note.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="offerAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Amount (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={askingPrice.toString()}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Make an offer if you're ready, or leave blank to inquire first.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Sending..." : "Send Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}