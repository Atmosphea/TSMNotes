import { useEffect } from 'react';

export function useParallaxFooter() {
  useEffect(() => {
    const handleFooterParallax = () => {
      const footer = document.querySelector('.parallax-footer');
      const mainContent = document.querySelector('.has-parallax-footer');
      
      if (!footer || !mainContent) return;
      
      const footerHeight = footer.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      const scrollHeight = document.body.scrollHeight - windowHeight;
      const scrollY = window.scrollY;
      
      // How far down the user has scrolled (as a percentage)
      const scrollPercentage = Math.min(scrollY / (scrollHeight - footerHeight), 1);
      
      // If we're in the footerHeight area from the bottom
      if (scrollPercentage > 0) {
        // Transform the footer based on scroll position
        const translateY = 100 - (scrollPercentage * 100);
        footer.classList.add('parallax-footer-visible');
        (footer as HTMLElement).style.transform = `translateY(${translateY}%)`;
      } else {
        footer.classList.remove('parallax-footer-visible');
        (footer as HTMLElement).style.transform = 'translateY(100%)';
      }
    };

    // Add the main content wrapper class
    const mainContent = document.querySelector('#root > div');
    if (mainContent) {
      mainContent.classList.add('has-parallax-footer');
    }

    window.addEventListener('scroll', handleFooterParallax);
    // Initial check
    handleFooterParallax();
    
    return () => {
      window.removeEventListener('scroll', handleFooterParallax);
      if (mainContent) {
        mainContent.classList.remove('has-parallax-footer');
      }
    };
  }, []);
}