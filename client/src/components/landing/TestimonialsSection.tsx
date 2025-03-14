import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

const testimonials = [
  {
    quote: "NoteTrade has completely transformed how we source performing notes. The verification system gives us confidence in the sellers we work with.",
    name: "Michael Johnson",
    title: "Note Portfolio Manager"
  },
  {
    quote: "As a note seller, I've been able to connect with serious buyers who understand the market. The platform's verification process ensures I'm dealing with legitimate investors.",
    name: "Sarah Rodriguez",
    title: "Note Servicer & Trader"
  },
  {
    quote: "The integrated due diligence tools have saved us countless hours. We can quickly evaluate potential investments using standardized metrics.",
    name: "Robert Thompson",
    title: "Investment Fund Manager"
  },
  {
    quote: "The quality of listings on NoteTrade is exceptional. Each note comes with comprehensive documentation that makes due diligence streamlined.",
    name: "Jennifer Adams",
    title: "Real Estate Investor"
  },
  {
    quote: "We've doubled our note portfolio since joining NoteTrade. The platform's verification system is a game-changer for connecting with serious sellers.",
    name: "David Wilson",
    title: "Private Equity Partner"
  }
];

const TestimonialsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    
    if (!scrollElement) return;
    
    let scrollInterval: ReturnType<typeof setInterval>;
    
    const startScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollElement && !isHovering) {
          if (scrollElement.scrollLeft >= scrollElement.scrollWidth - scrollElement.clientWidth) {
            scrollElement.scrollLeft = 0;
          } else {
            scrollElement.scrollLeft += 1;
          }
        }
      }, 20);
    };
    
    startScroll();
    
    return () => {
      clearInterval(scrollInterval);
    };
  }, [isHovering]);

  return (
    <section id="testimonials" className="py-8 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
      <div className="mx-auto">
        <div className="flex items-center h-20vh">
          <div className="w-1/6 px-8 flex-shrink-0">
            <div className="accent-border">
              <h2 className="text-2xl font-bold text-white">
                Industry Experts Trust NoteTrade
              </h2>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="flex-none w-80 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg border-l-4 border-primary"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-5 w-5 text-primary" />
                  <div className="text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-200 text-sm mb-3">
                  {testimonial.quote}
                </blockquote>
                <div className="text-right">
                  <h4 className="font-medium text-white text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            ))}
            
            {/* Duplicate first few testimonials to create infinite scroll illusion */}
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div 
                key={`repeat-${index}`} 
                className="flex-none w-80 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg border-l-4 border-primary"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-5 w-5 text-primary" />
                  <div className="text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-200 text-sm mb-3">
                  {testimonial.quote}
                </blockquote>
                <div className="text-right">
                  <h4 className="font-medium text-white text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
