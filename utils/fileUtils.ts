
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const link = document.createElement('a');
  
  if (mimeType.startsWith('image/') || mimeType === 'application/json' || mimeType === 'image/svg+xml') {
     // For base64 images or text-based files
     link.href = content;
  } else {
    const blob = new Blob([content], { type: mimeType });
    link.href = URL.createObjectURL(blob);
  }
  
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
