import React from 'react';
import { X } from 'lucide-react';
import { NoteListing } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { StatusIndicator } from './StatusIndicator';

interface NoteDetailModalProps {
  note: NoteListing;
  isOpen: boolean;
  onClose: () => void;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = React.useState(false);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the seller.",
        variant: "destructive"
      });
      return;
    }

    setIsRequesting(true);
    try {
      await apiRequest('POST', `/api/access-requests`, {
        noteListingId: note.id,
        buyerId: user.id,
        requestType: 'contact',
        message: 'I am interested in this note and would like more information.'
      });

      queryClient.invalidateQueries({ queryKey: ['/api/note-listings'] });
      
      toast({
        title: "Request Sent",
        description: "Your request to contact the seller has been sent. You'll be notified when they respond.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl mx-auto p-6 rounded-lg border border-gray-700 shadow-xl bg-gradient-to-b from-gray-900 to-black max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StatusIndicator 
                  status={note.status} 
                  accessRequests={0} 
                  lastAccessRequestAt={null} 
                />
                <h2 className="text-2xl font-bold text-white">{note.title}</h2>
              </div>
              <p className="text-gray-400 mt-1">Listed on {formatDate(note.listedAt)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {formatCurrency(note.askingPrice)}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {note.originalLoanAmount > 0 && (
                  <span>Original Loan: {formatCurrency(note.originalLoanAmount)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Property & Note Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Property Type</p>
                  <p className="text-white">{note.propertyType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Property Value</p>
                  <p className="text-white">{note.propertyValue ? formatCurrency(note.propertyValue) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">{[note.propertyCity, note.propertyState].filter(Boolean).join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ZIP / County</p>
                  <p className="text-white">{[note.propertyZipCode, note.propertyCounty].filter(Boolean).join(' / ') || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Note Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Note Type</p>
                  <p className="text-white">{note.noteType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Performance</p>
                  <p className="text-white">{note.performanceStatus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Interest Rate</p>
                  <p className="text-white">{note.interestRate ? `${note.interestRate}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payment Frequency</p>
                  <p className="text-white capitalize">{note.paymentFrequency || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">LTV Ratio</p>
                  <p className="text-white">{note.loanToValueRatio ? `${note.loanToValueRatio}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Lien Position</p>
                  <p className="text-white">{note.collateralType || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Terms */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Loan Terms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-gray-400 text-sm">Original Amount</p>
                <p className="text-white">{formatCurrency(note.originalLoanAmount)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Amount</p>
                <p className="text-white">{formatCurrency(note.currentLoanAmount)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Monthly Payment</p>
                <p className="text-white">{note.monthlyPaymentAmount ? formatCurrency(note.monthlyPaymentAmount) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Amortization</p>
                <p className="text-white capitalize">{note.amortizationType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Origination Date</p>
                <p className="text-white">{formatDate(note.loanOriginationDate)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Maturity Date</p>
                <p className="text-white">{formatDate(note.loanMaturityDate)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Remaining Term</p>
                <p className="text-white">{note.remainingLoanTerm || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Secured</p>
                <p className="text-white">{note.isSecured ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {note.description && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 whitespace-pre-line">{note.description}</p>
            </div>
          )}

          {/* Contact Button */}
          <div className="flex justify-center mt-3">
            <button
              onClick={handleContactSeller}
              disabled={isRequesting || note.status !== 'active'}
              className={`px-6 py-3 rounded-md text-white font-semibold shadow-lg 
                ${note.status === 'active' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-70'
                  : 'bg-gray-700 cursor-not-allowed opacity-70'
                } transition-all`}
            >
              {!user 
                ? "Login to Contact Seller" 
                : note.status !== 'active'
                  ? "Note Not Available"
                  : isRequesting
                    ? "Sending Request..."
                    : "Contact Seller"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailModal;