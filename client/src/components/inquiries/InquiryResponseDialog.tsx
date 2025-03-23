import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, CircleX, MessageCircle } from "lucide-react";

// Zod schema for form validation
const formSchema = z.object({
  responseMessage: z.string().min(10, {
    message: "Response message must be at least 10 characters.",
  }),
  status: z.enum(["accepted", "rejected", "countered"], {
    required_error: "Please select a response action.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Inquiry {
  id: number;
  buyerId: number;
  noteListingId: number;
  message: string;
  offerAmount: number | null;
  status: string;
  responseMessage: string | null;
  respondedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiryResponseDialogProps {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryResponseDialog({
  inquiry,
  isOpen,
  onClose,
}: InquiryResponseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responseMessage: "",
      status: "accepted",
    },
  });

  // Get currently selected status
  const watchStatus = form.watch("status");

  // Mutation to respond to inquiry
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest(`/api/inquiries/${inquiry.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseMessage: values.responseMessage,
          status: values.status,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/listing/${inquiry.noteListingId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/seller`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/buyer/${inquiry.buyerId}`] });
      
      // Show success toast
      toast({
        title: "Response Sent",
        description: `You have ${watchStatus} the inquiry.`,
        variant: "default",
      });
      
      // Reset form and close dialog
      form.reset();
      onClose();
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Failed to Send Response",
        description: "There was an error sending your response. Please try again.",
        variant: "destructive",
      });
      console.error("Error responding to inquiry:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Respond to Inquiry
            </span>
          </DialogTitle>
          <DialogDescription>
            Review the inquiry and provide a response to the potential buyer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-2 p-4 bg-muted rounded-lg">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-4 w-4 mr-2 text-primary" />
            <h4 className="font-medium text-sm">Original Inquiry:</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{inquiry.message}</p>
          {inquiry.offerAmount && (
            <div className="mt-2">
              <p className="text-sm font-medium">Offer Amount:</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(inquiry.offerAmount)}
              </p>
            </div>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Action</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your response" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepted" className="flex items-center">
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Accept Inquiry
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center">
                            <CircleX className="h-4 w-4 mr-2 text-red-600" />
                            Decline Inquiry
                          </div>
                        </SelectItem>
                        <SelectItem value="countered">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Counter Offer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {watchStatus === "accepted" && "Accept the inquiry and proceed with the sale."}
                    {watchStatus === "rejected" && "Decline the inquiry. The note will remain listed."}
                    {watchStatus === "countered" && "Counter with different terms or pricing."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responseMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Response</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        watchStatus === "accepted" 
                          ? "Thank you for your inquiry. I'm happy to accept your offer..." 
                          : watchStatus === "rejected"
                          ? "Thank you for your inquiry. Unfortunately..."
                          : "Thank you for your inquiry. I'd be open to selling if..."
                      }
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your decision and any next steps.
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  watchStatus === "accepted" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : watchStatus === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              >
                {isSubmitting ? "Sending..." : `Send Response`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}