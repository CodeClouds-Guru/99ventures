import { useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import CreateUpdateHeader from './CreateUpdateHeader';

// Hooks version of the Class below (done by me)
const CreateUpdateForm = ({ input, meta }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const onEditorStateChange = editorState => {
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