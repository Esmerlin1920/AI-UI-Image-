
import React, { useState, useRef } from 'react';
import { readFileAsDataURL } from '../utils/fileUtils';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (dataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        onImageUpload(dataUrl);
        setFileName(file.name);
      } catch (error) {
        console.error("Error reading file:", error);
        setFileName('Error al cargar');
      }
    }
  };

  const handleLabelClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div 
        onClick={handleLabelClick}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-cyan-500 transition-colors duration-200"
      >
        <div className="space-y-1 text-center">
           <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-400">
            <p className="pl-1">
              {fileName ? `Archivo: ${fileName}` : 'Haz clic para seleccionar un archivo'}
            </p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
