
export enum Tool {
  Brush = 'brush',
  Rectangle = 'rectangle',
  Eraser = 'eraser',
}

export interface LayoutItem {
  id: string;
  type: 'button' | 'input' | 'text' | 'title' | 'icon' | 'card' | 'navbar' | 'tab' | 'form' | 'image';
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zone: string;
  props: {
    state?: string;
    variant?: string;
    required?: boolean;
    link?: string;
    [key: string]: any;
  };
}

export interface GeneratedResult {
  editedImage: string; // base64 encoded image string
  svg: string;
  layout: LayoutItem[];
}

export interface GenerateUiEditParams {
  baseImage: string;
  maskImage: string;
  referenceImage: string | null;
  prompt: string;
}

export interface CanvasEditorRef {
  exportMask: () => string;
  clearAll: () => void;
}
