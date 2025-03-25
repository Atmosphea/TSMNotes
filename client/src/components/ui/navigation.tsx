
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const boxes = [
    {
      title: "Marketplace",
      path: "/marketplace",
      image: "/marketplace.jpg"
    },
    {
      title: "Sell",
      path: "/selling",
      image: "/selling.jpg"
    },
    {
      title: isAuthenticated ? "Profile" : "Login",
      path: isAuthenticated ? "/profile" : "/login",
      image: "/profile.jpg"
    }
  ];

  const handleBoxClick = (path: string) => {
    setIsOpen(false);
    window.location.href = path;
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 w-12 h-12 bg-[#b4d398] rounded-full z-50 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className={`transform transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40">
          <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-4">
              {boxes.map((box, index) => (
                <motion.div
                  key={box.title}
                  className="w-[90vw] h-[30vh] md:w-[22vw] md:h-[75vh] bg-[#b4d398] rounded-lg overflow-hidden cursor-pointer relative"
                  whileHover={{ 
                    rotateX: 5,
                    rotateY: 5,
                    scale: 1.02
                  }}
                  onClick={() => handleBoxClick(box.path)}
                >
                  <div className="h-[75%] flex items-center justify-center">
                    <h2 className="text-[28px] font-serif text-white text-center">
                      {box.title}
                    </h2>
                  </div>
                  <div 
                    className="h-[25vh] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${box.image})` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
