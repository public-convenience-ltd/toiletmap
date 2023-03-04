import Editor, { EditorProps } from '@monaco-editor/react';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import Box from '../Box';

export type MonacoEditorOptions = {
  stopRenderingLineAfter: number;
};

export type MonacoEditorA = MutableRefObject<any>;
export type MonacoEditorB = MutableRefObject<any>;
export type MonacoTextModal = any;

export type MonacoOnInitializePane = (
  monacoEditorRef: MonacoEditorA,
  editorRef: MonacoEditorB,
  model: MonacoTextModal
) => void;

export type CodeViewerProps = {
  code: string;
  setCode?: Dispatch<SetStateAction<string>>;

  editorOptions?: MonacoEditorOptions;

  onInitializePane: MonacoOnInitializePane;
};

const CodeViewer = (props: CodeViewerProps): JSX.Element => {
  const { code, setCode, editorOptions, onInitializePane } = props;

  const monacoEditorRef = useRef<any | null>(null);
  const editorRef = useRef<any | null>(null);

  useEffect(() => {
    if (monacoEditorRef?.current) {
      const model: any = monacoEditorRef.current.getModels();

      if (model?.length > 0) {
        onInitializePane(monacoEditorRef, editorRef, model);
      }
    }
  });

  return (
    <Editor
      language="json"
      onChange={(value, _event) => {
        if (setCode) setCode(value);
      }}
      onMount={(editor, monaco) => {
        monacoEditorRef.current = monaco.editor;
        editorRef.current = editor;
      }}
      options={{
        ...(editorOptions ?? {}),
        fontSize: 15,
        minimap: { enabled: false },
        lineNumbers: 'off',
      }}
      theme="vs-dark"
      value={code}
      css={{}}
    />
  );
};

export default CodeViewer;
