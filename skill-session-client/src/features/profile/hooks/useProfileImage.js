// src/features/profile/hooks/useProfileImage.js
import { useState } from 'react';

export const useProfileImage = (initialImage = '') => {
  const [image, setImage] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setIsUploading(true);
      };
      
      reader.onloadend = () => {
        setImage(reader.result);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  return {
    image,
    setImage,
    isUploading,
    handleImageChange
  };
};