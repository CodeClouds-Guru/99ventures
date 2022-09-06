import { useRef } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import CreateUpdateHeader from './CreateUpdateHeader';
import WYSIWYGEditor from 'app/shared-components/WYSIWYGEditor';

const CreateUpdateForm = ({ input, meta }) => {
    const inputElement = useRef();
    const onChangeInEditor = (input) => {
        console.log(input);
    }

    return (
        <>
            <WYSIWYGEditor ref={inputElement} onChange={onChangeInEditor}/>
        </>
    )   
}

export default CreateUpdateForm;