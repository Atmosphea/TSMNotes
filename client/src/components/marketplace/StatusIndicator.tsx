import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addDays, isPast } from 'date-fns';

interface StatusIndicatorProps {
  status: string;
  accessRequests?: number;
  lastAccessRequestAt?: Date | null;
  soldAt?: Date | null;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  accessRequests = 0, 
  lastAccessRequestAt = null,
  soldAt = null,
  className = ''
}: StatusIndicatorProps) {
  // Function to determine if access requests are still active (within 48 hours)
  const areAccessRequestsActive = () => {
    if (!lastAccessRequestAt) return false;
    
    // Check if the last access request is within the last 48 hours
    const expirationDate = addDays(new Date(lastAccessRequestAt), 2);
    return !isPast(expirationDate);
  };
  
  // Determine the status color and count
  const getStatusInfo = () => {
    // If the listing is sold, show red
    if (status === 'sold') {
      return {
        color: 'bg-red-500',
        tooltip: 'Sold',
        count: 0,
        showCount: false
      };
    }
    
    // If there are active access requests, show yellow dots
    if (accessRequests > 0 && areAccessRequestsActive()) {
      return {
        color: 'bg-yellow-500',
        tooltip: `${accessRequests} active buyer${accessRequests > 1 ? 's' : ''} reviewing`,
        count: accessRequests,
        showCount: accessRequests > 1
      };
    }
    
    // Default to available (green)
    return {
      color: 'bg-green-500',
      tooltip: 'Available for purchase',
      count: 0,
      showCount: false
    };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center ${className}`}>
            {/* Main status dot */}
            <div 
              className={`${statusInfo.color} h-3 w-3 rounded-full ${status === 'sold' ? 'opacity-70' : ''}`} 
            />
            
            {/* Show additional dots if needed */}
            {statusInfo.showCount && (
              <div className="flex ml-0.5 space-x-0.5">
                {Array.from({ length: Math.min(statusInfo.count - 1, 3) }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`${statusInfo.color} h-2 w-2 rounded-full`} 
                  />
                ))}
                {statusInfo.count > 4 && (
                  <span className="text-xs text-yellow-500 ml-0.5">+{statusInfo.count - 4}</span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}