import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  minWidth?: number;
  minHeight?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9, // Default banner aspect ratio
  cropShape = 'rect',
  minWidth = 100,
  minHeight = 100,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.95,
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Crop Image
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={minWidth}
            minHeight={minHeight}
            circularCrop={cropShape === 'round'}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={src}
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className="text-sm text-slate-400 mb-4">
          <p>• Drag the corners to resize the crop area</p>
          <p>• Drag the center to move the crop area</p>
          <p>• The cropped area will be used as your {aspectRatio === 1 ? 'icon' : 'banner'}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            disabled={!completedCrop}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
