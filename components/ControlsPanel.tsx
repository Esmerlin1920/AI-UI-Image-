
import React from 'react';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';

interface ControlsPanelProps {
  setBaseImage: (dataUrl: string) => void;
  setReferenceImage: (dataUrl: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  setBaseImage,
  setReferenceImage,
  prompt,
  setPrompt,
  onGenerate,
  onClear,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <ImageUploader 
        id="base-image-uploader"
        label="1. Subir Imagen Base (PNG/JPG)"
        onImageUpload={setBaseImage}
      />
      <ImageUploader 
        id="reference-image-uploader"
        label="2. Subir Imagen de Referencia (Opcional)"
        onImageUpload={setReferenceImage}
      />
      <div className="flex-grow flex flex-col">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={onGenerate}
            isLoading={isLoading}
          />
      </div>
      <button
          onClick={onClear}
          disabled={isLoading}
          className="w-full mt-auto bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
      >
          Limpiar Todo
      </button>
    </div>
  );
};

export default ControlsPanel;
