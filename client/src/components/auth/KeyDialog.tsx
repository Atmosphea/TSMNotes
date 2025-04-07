import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyDialog = ({ open, onOpenChange }: KeyDialogProps) => {
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/verify-invite-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key.trim() }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        navigate(`/signup?key=${encodeURIComponent(key.trim())}`);
      } else {
        toast({
          title: "Invalid Key",
          description: "The invite key you entered is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify the invite key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/95 border border-white/10 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Key className="mr-2 h-5 w-5 text-primary" />
            Enter your invite key
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Enter your exclusive invite key to gain access to the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter invite key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !key.trim()}
              className="nav-button-primary relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <span className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 transition-opacity"></span>
                  <span className="flex items-center relative z-10">
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KeyDialog;