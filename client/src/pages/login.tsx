import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Pass credentials as an object to match AuthContext expectations
      await login({
        username: values.username,
        password: values.password
      });
      // Login success is handled in the AuthContext
    } catch (error) {
      // Error is handled in the AuthContext, but we can add additional handling here
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
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
              MEMBER LOGIN
            </h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  "SIGN IN"
                )}
              </Button>

              <div className="flex items-center justify-between mt-4">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/50 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <label className="text-sm text-gray-300">
                        Remember Me
                      </label>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-gray-300 hover:text-white">
                  Forgot Password?
                </a>
              </div>

              <div className="mt-6 text-center text-sm text-gray-300">
                Don't have an account?{" "}
                <a href="/signup" className="text-primary hover:underline">
                  Sign up
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
