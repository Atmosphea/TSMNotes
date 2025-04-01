import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Mail } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { InsertAccessRequest } from "@shared/schema";

interface ContactRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteListingId: number;
  buyerId: number;
  title: string;
  askingPrice: number;
}

export default function ContactRequestDialog({
  open,
  onOpenChange,
  noteListingId,
  buyerId,
  title,
  askingPrice
}: ContactRequestDialogProps) {
  const { toast } = useToast();
  
  const requestMutation = useMutation({
    mutationFn: async () => {
      const requestData: Partial<InsertAccessRequest> = {
        buyerId,
        noteListingId,
        requestType: 'contact',
        status: 'pending',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      };
      
      const res = await apiRequest('POST', '/api/request-access', requestData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent",
        description: "Note details have been sent to your email. You have 48 hours to review this note.",
        variant: "default",
      });
      
      // Invalidate any cached note listings to update the status indicators
      queryClient.invalidateQueries({ queryKey: ['/api/note-listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/note-listings', noteListingId] });
      
      // Close the dialog
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message || "There was an error requesting contact information. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleRequest = () => {
    requestMutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Contact Information</DialogTitle>
          <DialogDescription>
            This will send the note details and seller contact information to your email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">Asking Price: {formatCurrency(askingPrice)}</p>
            <p className="text-xs text-muted-foreground">
              You'll have 48 hours of exclusive access to review this note before it becomes available to other buyers again.
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <Mail className="h-12 w-12 text-primary opacity-80" />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleRequest}
            disabled={requestMutation.isPending}
            className="min-w-[120px]"
          >
            {requestMutation.isPending ? "Sending..." : "Send to my email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}