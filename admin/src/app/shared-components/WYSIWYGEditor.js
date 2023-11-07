import { forwardRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { convertToRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import clsx from 'clsx';

const Root = styled('div')({
  '& .rdw-dropdown-selectedtext': {
    color: 'inherit',
  },
  '& .rdw-editor-toolbar': {
    borderWidth: '0 0 1px 0!important',
    margin: '0!important',
  },
  '& .rdw-editor-main': {
    padding: '8px 12px',
    height: '230px!important',
  },
});

const WYSIWYGEditor = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const mutateOnChange = (val) => {
    let str = draftToHtml(val)
    if (!str || /^<p>(&nbsp;)*<\/p>$/.test(str.trim())) {
      return props.onChange('');
    }
    return props.onChange(str);
  };
  const mutatedProps = {
    ...props,
    onChange: mutateOnChange
  }

  function onEditorStateChange(_editorState) {
    setEditorState(_editorState);
    return props.onChange(draftToHtml(convertToRaw(_editorState.getCurrentContent())));
  }

  return (
    <Root className={clsx('rounded-4 border-1 overflow-hidden w-full', props.className)}>
      <Editor 
        ref={ref} 
        {...mutatedProps} 
        editorState={editorState} 
        onEditorStateChange={onEditorStateChange} 
        toolbarCustomButtons={ (props.toolbarCustomButtons && props.toolbarCustomButtons.length) ? props.toolbarCustomButtons : [] } 
        toolbar={{
          options: ['emoji', 'inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'remove', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
          }
        }}
      />
    </Root>
  );
});

export default WYSIWYGEditor;
