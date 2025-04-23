import React from 'react';
import './styles/ImageGallery.css';

/**
 * ImageGallery Component
 * Displays a gallery of images with optional captions
 * 
 * Expected data structure:
 * {
 *   type: "image_gallery",
 *   title: "Photo Gallery", // Optional
 *   description: "Collection of images", // Optional
 *   layout: "grid" | "carousel", // Optional, defaults to "grid"
 *   images: [
 *     {
 *       url: "https://example.com/image1.jpg",
 *       caption: "Image 1 caption", // Optional
 *       alt: "Image 1 alt text", // Optional
 *       action: { // Optional
 *         action: "view_image",
 *         payload: { imageId: "123" }
 *       }
 *     }
 *   ]
 * }
 */
const ImageGallery = ({ data, onAction }) => {
  // Handle missing data
  if (!data || !data.images || data.images.length === 0) return null;
  
  const {
    title,
    description,
    layout = 'grid',
    images = []
  } = data;
  
  // Handle image clicks
  const handleImageClick = (action, payload) => {
    if (onAction && action) {
      onAction(action.action, action.payload);
    }
  };
  
  return (
    <div className={`image-gallery ${layout === 'carousel' ? 'carousel-layout' : 'grid-layout'}`}>
      {title && <h3 className="gallery-title">{title}</h3>}
      {description && <p className="gallery-description">{description}</p>}
      
      <div className="gallery-container">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="gallery-item"
            onClick={() => handleImageClick(image.action, image.payload)}
          >
            <img 
              src={image.url} 
              alt={image.alt || `Image ${index + 1}`} 
              className="gallery-image"
            />
            {image.caption && (
              <div className="image-caption">{image.caption}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
