
import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
    const examples = [
        'agrega botón "Guardar" primario arriba derecha',
        'en la zona sombreada, pon un input "Correo" obligatorio',
        'recrea la pantalla de "Home" como en la Imagen de Referencia',
        'inserta un logo sin fondo en el header, centrado'
    ];

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    }
  
    return (
    <div className="flex flex-col h-full">
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">3. Describe los cambios</label>
      <div className='mb-2'>
        <p className="text-xs text-gray-500">Ejemplos:</p>
        <ul className="text-xs text-cyan-400 list-disc list-inside">
            {examples.map((ex, i) => (
                <li key={i} className="hover:text-cyan-300 cursor-pointer" onClick={() => handleExampleClick(ex)}>
                    {ex}
                </li>
            ))}
        </ul>
      </div>
      <textarea
        id="prompt"
        name="prompt"
        rows={6}
        className="block w-full shadow-sm sm:text-sm border-gray-600 rounded-md bg-gray-900 focus:ring-cyan-500 focus:border-cyan-500 flex-grow"
        placeholder="Ej: 'cambia el color del botón a azul'..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </>
        ) : 'Generar UI'}
      </button>
    </div>
  );
};

export default PromptInput;
