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
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

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
  const { login: localLogin } = useAuth();
  const { login: kindeLogin, register } = useKindeAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // This function can be kept for backward compatibility or removed
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const success = await localLogin(values.username, values.password);
      if (success) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
        // Get redirect URL from query params or default to marketplace
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/marketplace";
        setLocation(redirect);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Handler for Kinde login
  const handleKindeLogin = () => {
    kindeLogin();
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

              {/* Regular login button */}
              <Button
                type="submit"
                className="w-full bg-[#c49c6c] hover:bg-[#b38b5b] text-white font-semibold"
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
              
              {/* Divider with text */}
              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="mx-4 flex-shrink text-white/60 text-sm">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>
              
              {/* Kinde Auth buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleKindeLogin}
                  className="w-full bg-[#c49c6c] hover:bg-[#b38b5b] text-white font-semibold"
                >
                  LOGIN WITH KINDE
                </Button>
                
                <Button
                  type="button"
                  onClick={handleKindeRegister}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  REGISTER WITH KINDE
                </Button>
              </div>

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
                <a href="/signup" className="text-[#c49c6c] hover:underline">
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
