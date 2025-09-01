
import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import ControlsPanel from './components/ControlsPanel';
import CanvasEditor from './components/CanvasEditor';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import { generateUiEdit } from './services/geminiService';
import type { GeneratedResult, CanvasEditorRef } from './types';

export default function App(): React.ReactElement {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const canvasRef = useRef<CanvasEditorRef>(null);

  const handleGenerate = useCallback(async () => {
    if (!baseImage || !prompt.trim()) {
      setError('Por favor, sube una imagen base y escribe una instrucción.');
      return;
    }

    if (!canvasRef.current) {
      setError('El editor de lienzo no está listo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingMessage('Preparando imágenes y enviando a la IA...');

    try {
      const maskImage = canvasRef.current.exportMask();
      setLoadingMessage('La IA está analizando y editando la interfaz. Esto puede tardar un momento...');

      const apiResult = await generateUiEdit({
        baseImage,
        maskImage,
        referenceImage,
        prompt,
      });
      
      setResult(apiResult);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `Error: ${e.message}` : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [baseImage, referenceImage, prompt]);
  
  const handleClear = () => {
    setBaseImage(null);
    setReferenceImage(null);
    setPrompt('');
    setResult(null);
    setError(null);
    if(canvasRef.current) {
      canvasRef.current.clearAll();
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow grid grid-cols-1 xl:grid-cols-12 gap-4 p-4">
        <div className="xl:col-span-3 bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4 border border-gray-700 h-full">
          <ControlsPanel
            setBaseImage={setBaseImage}
            setReferenceImage={setReferenceImage}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            onClear={handleClear}
            isLoading={isLoading}
          />
        </div>
        
        <div className="xl:col-span-6 bg-gray-800/50 rounded-lg flex flex-col items-center justify-center border border-gray-700 p-2 min-h-[60vh] xl:min-h-0">
          <CanvasEditor ref={canvasRef} baseImage={baseImage} />
        </div>

        <div className="xl:col-span-3 bg-gray-800/50 rounded-lg p-4 flex flex-col border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Resultados Generados</h2>
          {isLoading && <Spinner message={loadingMessage} />}
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}
          {result && !isLoading && <ResultsDisplay result={result} />}
          {!isLoading && !result && !error && (
             <div className="flex-grow flex items-center justify-center text-gray-500">
              <p>Los resultados aparecerán aquí.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
