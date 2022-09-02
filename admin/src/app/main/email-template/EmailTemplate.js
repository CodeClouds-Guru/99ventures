import * as React from 'react';
import { useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Hooks version of the Class below (done by me)
const EmailTemplate = ({ input, meta }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const onEditorStateChange = editorState => {
        setEditorState(editorState)
        return input.onChange(convertToRaw(editorState.getCurrentContent()))
    }

    return (
        <div className="editor">
            <Editor
                editorState={editorState}
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
                onEditorStateChange={onEditorStateChange}
            />
            {
                console.log('editorState => ', convertToRaw(editorState.getCurrentContent()))
            }
        </div>
    )
}

export default EmailTemplate;