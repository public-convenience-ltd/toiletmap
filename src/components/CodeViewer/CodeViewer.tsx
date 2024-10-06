import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import Box from '../Box';

// Define custom editor options by extending Monaco's options if needed
export type MonacoEditorOptions = {
  stopRenderingLineAfter: number;
} & Partial<monaco.editor.IStandaloneEditorConstructionOptions>;

// Define types for the editor and monaco instances
export type MonacoEditorRef =
  MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
export type MonacoInstanceRef = MutableRefObject<typeof monaco.editor | null>;
export type MonacoTextModel = monaco.editor.ITextModel;

// Callback type for initialization
export type MonacoOnInitializePane = (
  monacoEditorRef: MonacoInstanceRef,
  editorRef: MonacoEditorRef,
  model: MonacoTextModel,
) => void;

// Component props type
export type CodeViewerProps = {
  code: string;
  setCode?: Dispatch<SetStateAction<string>>;
  editorOptions?: MonacoEditorOptions;
  onInitializePane: MonacoOnInitializePane;
};

const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  setCode,
  editorOptions,
  onInitializePane,
}) => {
  // Refs to store Monaco editor instances
  const monacoInstanceRef = useRef<typeof monaco.editor | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Effect to initialize the pane when the editor and models are available
  useEffect(() => {
    if (monacoInstanceRef.current && editorRef.current) {
      const models = monacoInstanceRef.current.getModels();

      if (models.length > 0) {
        onInitializePane(monacoInstanceRef, editorRef, models[0]);
      }
    }
  }, [onInitializePane]);

  // Handler for editor mount event
  const handleMount: OnMount = (editor, monacoInstance) => {
    monacoInstanceRef.current = monacoInstance.editor;
    editorRef.current = editor;
  };

  // Handler for content change in the editor
  const handleChange = (value: string | undefined) => {
    if (setCode && value !== undefined) {
      setCode(value);
    }
  };

  // Merge custom options with default Monaco options
  const mergedOptions = {
    fontSize: 15,
    minimap: { enabled: false },
    lineNumbers: 'off',
    stopRenderingLineAfter: editorOptions?.stopRenderingLineAfter,
    ...editorOptions, // Allow overriding with additional options
  } satisfies monaco.editor.IStandaloneEditorConstructionOptions;

  return (
    <Box height={'100%'}>
      <Editor
        language="json"
        value={code}
        onChange={handleChange}
        onMount={handleMount}
        options={mergedOptions}
        theme="vs-dark"
      />
    </Box>
  );
};

export default CodeViewer;
