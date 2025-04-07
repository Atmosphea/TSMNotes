import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select your role")
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  className?: string;
  variant?: "default" | "footer";
}

const WaitlistForm = ({ className, variant = "default" }: WaitlistFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      role: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: WaitlistFormValues) => {
      try {
        // Store to our local data file
        const res = await fetch('/api/local-waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            role: values.role,
            timestamp: new Date().toISOString()
          }),
        });
        
        if (!res.ok) {
          throw new Error("Failed to join waitlist");
        }
        
        return res.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Thank you for joining our waitlist! We'll be in touch soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: WaitlistFormValues) => {
    mutation.mutate(values);
  };

  if (submitted) {
    return (
      <div className={`p-4 bg-green-50 rounded-md text-green-800 flex items-center ${className}`}>
        <CheckCircle className="h-5 w-5 mr-2" />
        <span>Thank you for joining our waitlist! We'll be in touch soon.</span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`flex flex-col sm:flex-row gap-4 ${className}`}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-primary-400" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-white/80" />
              </FormItem>
            )}
          />
          
          <input type="hidden" {...form.register("role")} value="interested" />
          
          <Button type="submit" className="bg-white text-primary-900 hover:bg-primary-50" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a:</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="note-seller">Note Seller</SelectItem>
                  <SelectItem value="note-buyer">Note Buyer</SelectItem>
                  <SelectItem value="both">Both Buyer & Seller</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="mr-2">Reserve My Spot</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default WaitlistForm;
