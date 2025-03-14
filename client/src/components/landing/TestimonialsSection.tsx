import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  initials: string;
}

const StarRating = () => {
  return (
    <div className="flex items-center mb-4">
      <div className="text-amber-400 flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5" fill="currentColor" />
        ))}
      </div>
    </div>
  );
};

const Testimonial = ({ quote, name, title, initials }: TestimonialProps) => {
  return (
    <Card className="p-6">
      <StarRating />
      <blockquote className="text-gray-600 mb-4">
        "{quote}"
      </blockquote>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
          {initials}
        </div>
        <div className="ml-3">
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </Card>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Trusted by Note Industry Professionals
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Hear what industry veterans have to say about our platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Testimonial
            quote="NoteTrade has completely transformed how we source performing notes. The verification system gives us confidence in the sellers we work with, and the detailed listings have all the information we need upfront."
            name="Michael Johnson"
            title="Note Portfolio Manager"
            initials="MJ"
          />
          
          <Testimonial
            quote="As a note seller, I've been able to connect with serious buyers who understand the market. The platform's verification process ensures I'm dealing with legitimate investors, not tire-kickers."
            name="Sarah Rodriguez"
            title="Note Servicer & Trader"
            initials="SR"
          />
          
          <Testimonial
            quote="The integrated due diligence tools have saved us countless hours. We can quickly evaluate potential investments using standardized metrics and make decisions faster than ever before."
            name="Robert Thompson"
            title="Investment Fund Manager"
            initials="RT"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
