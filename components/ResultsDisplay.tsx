
import React, { useState } from 'react';
import type { GeneratedResult } from '../types';
import { downloadFile } from '../utils/fileUtils';

interface ResultsDisplayProps {
  result: GeneratedResult;
}

enum Tab {
  Image = 'image',
  SVG = 'svg',
  JSON = 'json',
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Image);

  const { editedImage, svg, layout } = result;

  const handleDownload = () => {
    switch(activeTab) {
      case Tab.Image:
        downloadFile(editedImage, 'imagen_editada.png', 'image/png');
        break;
      case Tab.SVG:
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        downloadFile(svgDataUrl, 'layout.svg', 'image/svg+xml');
        break;
      case Tab.JSON:
        const jsonDataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(layout, null, 2))}`;
        downloadFile(jsonDataUrl, 'layout.json', 'application/json');
        break;
    }
  };

  const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
          activeTab === tab 
            ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-400' 
            : 'text-gray-400 hover:bg-gray-700/50'
        }`}
      >
        {label}
      </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-700">
        <TabButton tab={Tab.Image} label="Imagen Editada" />
        <TabButton tab={Tab.SVG} label="SVG" />
        <TabButton tab={Tab.JSON} label="JSON" />
      </div>
      
      <div className="flex-grow bg-gray-900/50 p-2 overflow-auto rounded-b-lg mt-1 relative">
        {activeTab === Tab.Image && (
          <img src={editedImage} alt="Resultado generado" className="max-w-full max-h-full object-contain mx-auto" />
        )}
        {activeTab === Tab.SVG && (
          <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
            <code>{svg}</code>
          </pre>
        )}
        {activeTab === Tab.JSON && (
          <pre className="text-xs text-green-300 whitespace-pre-wrap break-all">
            <code>{JSON.stringify(layout, null, 2)}</code>
          </pre>
        )}
      </div>

       <button
        onClick={handleDownload}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
      >
        Descargar {activeTab.toUpperCase()}
      </button>
    </div>
  );
};

export default ResultsDisplay;
