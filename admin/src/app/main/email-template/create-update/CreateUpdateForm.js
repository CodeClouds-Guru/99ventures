import { useState, useEffect, useRef } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import CreateUpdateHeader from './CreateUpdateHeader';

const CreateUpdateForm = ({ input, meta }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const onEditorStateChange = editorState => {
        console.log(22, editorState, input, meta)
        setEditorState(editorState)
        return input.onChange(convertToRaw(editorState.getCurrentContent()))
    }

    return (
        <>
            <CreateUpdateHeader />
            <div className="editor">
                <Editor
                    editorState={editorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    toolbarClassName="toolbar-class"
                    onEditorStateChange={onEditorStateChange}
                />
                {
                    console.log('editorState => ', convertToRaw(editorState.getCurrentContent()))
                }
            </div>
        </>
    )
}

export default CreateUpdateForm;