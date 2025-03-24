import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface KeyEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyEntryDialog: React.FC<KeyEntryDialogProps> = ({ open, onOpenChange }) => {
  const [key, setKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite key",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real implementation, we would verify the key against a database
    // For now, we're storing it in localStorage and redirecting to signup
    localStorage.setItem('inviteKey', key.trim());
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Success",
        description: "Your key has been validated successfully",
      });
      onOpenChange(false);
      setLocation('/signup');
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Enter Your Invite Key</DialogTitle>
          <DialogDescription>
            Please enter the invite key you received to gain access to the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="key"
              value={key}
              onChange={handleKeyChange}
              placeholder="Enter your invite key"
              className="w-full focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Verifying...
                </>
              ) : (
                'Continue to Registration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KeyEntryDialog;