import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const formSchema = z
  .object({
    username: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    inviteKey: z.string().min(1, {
      message: "Invite key is required.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signup: localSignup } = useAuth();
  const { register } = useKindeAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      inviteKey: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const success = await localSignup(
        values.username,
        values.email,
        values.password,
        values.inviteKey,
      );
      if (success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        setLocation("/selling");
      } else {
        toast({
          title: "Registration failed",
          description:
            "Invalid invite key or username already exists. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Handler for Kinde register
  const handleKindeRegister = () => {
    register();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center p-5">
        <div className="absolute inset-5 border border-white/20"></div>
        
        <div className="w-full max-w-md bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4">
              <svg viewBox="0 0 100 100" className="text-white">
                <path d="M50 0 L100 100 L0 100 Z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white">
              CREATE ACCOUNT
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Username" 
                        className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inviteKey"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Invite Key" 
                        className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-[#c49c6c] hover:bg-[#b38b5b] text-white font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating account...
                  </>
                ) : (
                  "CREATE ACCOUNT"
                )}
              </Button>
              
              {/* Divider with text */}
              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 flex-shrink text-white/60 text-sm">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>
              
              {/* Kinde Register Button */}
              <Button
                type="button"
                onClick={handleKindeRegister}
                className="w-full bg-[#c49c6c] hover:bg-[#b38b5b] text-white font-semibold"
              >
                REGISTER WITH KINDE
              </Button>

              <div className="mt-6 text-center text-sm text-gray-300">
                Already have an account?{" "}
                <Link href="/login">
                  <a className="text-[#c49c6c] hover:underline">Sign in</a>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
