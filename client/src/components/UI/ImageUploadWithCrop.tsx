import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

interface ImageUploadWithCropProps {
  label: string;
  currentImage?: string;
  onImageChange: (file: File) => void;
  aspectRatio?: number;
  accept?: string;
  cropShape?: 'rect' | 'round';
  minWidth?: number;
  minHeight?: number;
  description?: string;
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  label,
  currentImage,
  onImageChange,
  aspectRatio = 16 / 9,
  accept = 'image/*',
  cropShape = 'rect',
  minWidth = 100,
  minHeight = 100,
  description,
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Create a File object from the Blob
    const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', {
      type: 'image/jpeg',
    });

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    setPreview(previewUrl);

    // Call the parent's onChange handler
    onImageChange(croppedFile);

    // Close the cropper
    setShowCropper(false);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop('');
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      )}

      <div className="space-y-4">
        {/* Current/Preview Image */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className={`w-full max-w-md object-cover rounded-lg ${
                aspectRatio === 1 ? 'h-32 w-32' : 'h-48'
              }`}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {preview ? 'Change Image' : 'Upload Image'}
          </label>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          src={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          minWidth={minWidth}
          minHeight={minHeight}
        />
      )}
    </div>
  );
};

export default ImageUploadWithCrop;
