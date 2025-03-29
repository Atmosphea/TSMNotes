
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1, {
    message: 'Username is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
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
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Check if username contains a colon (username:password format)
      if (values.username.includes(':')) {
        const [username, password] = values.username.split(':');
        if (username && password) {
          const success = await login(username, password);
          if (success) {
            toast({
              title: 'Login successful',
              description: 'You have been logged in successfully.',
            });
            setLocation('/marketplace');
            return;
          }
        }
      }
      
      // Regular login if not using username:password format
      const success = await login(values.username, values.password);
      if (success) {
        toast({
          title: 'Login successful',
          description: 'You have been logged in successfully.',
        });
        setLocation('/marketplace');
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center p-5">
      <div className="absolute inset-5 border border-white/20"></div>
      
      <div className="w-full max-w-md bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4">
            <svg viewBox="0 0 100 100" className="text-white">
              <path d="M50 0 L100 100 L0 100 Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">MEMBER LOGIN</h1>
        </div>

        <Alert className="mb-4 bg-primary/10 text-white border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can also login with format: <span className="font-mono font-semibold">username:password</span>
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Username or username:password"
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
                'SIGN IN'
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
                    <label className="text-sm text-gray-300">Remember Me</label>
                  </FormItem>
                )}
              />
              <a href="#" className="text-sm text-gray-300 hover:text-white">
                Forgot Password?
              </a>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
