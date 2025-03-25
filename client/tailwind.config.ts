import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative; /* For absolute positioning of the circle */
`;

const Circle = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #b4d398;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) { /* Adjust for mobile */
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }
`;

const Popup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Dimmed background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; /* Ensure it's on top */
  opacity: 0;
  pointer-events: none; /* Prevent interaction when closed */
  transition: opacity 0.3s ease;


  &.open {
    opacity: 1;
    pointer-events: auto;
  }
`;


const Box = styled.div`
  width: 22vw;
  height: 75vh;
  background-color: #b4d398;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  font-family: serif;

  &:hover {
    transform: translate(2px, 2px) rotateY(2deg); /* Subtle 3D effect */
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);
  }

  h2 {
    font-size: 28px;
    margin-bottom: 25vh;
    text-align: center;
    margin-top: 20px;
  }

  img {
    width: 100%;
    height: 25vh;
    object-fit: cover;
  }


  @media (max-width: 768px) {
    width: 90vw;
    height: 30vh;
    margin: 2vh;
  }
`;

function Navigation() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Container>
      <Circle onClick={() => setPopupOpen(!popupOpen)}>
        {/* Add an icon here */}
      </Circle>
      <Popup className={popupOpen ? 'open' : ''}>
        <Box>
          <h2>Marketplace</h2>
          <img src="marketplace-image.jpg" alt="Marketplace" /> {/* Replace with actual image */}
        </Box>
        <Box>
          <h2>Sell</h2>
          <img src="sell-image.jpg" alt="Sell" /> {/* Replace with actual image */}
        </Box>
        <Box>
          <h2>Profile</h2>
          <img src="profile-image.jpg" alt="Profile" /> {/* Replace with actual image */}
        </Box>
      </Popup>
    </Container>
  );
}

export default Navigation;