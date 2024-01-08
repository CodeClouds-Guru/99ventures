import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CreateEditHeader from '../crud/create-edit/CreateEditHeader';
import { useState } from 'react';
import CreateUpdateForm from './CreateUpdateForm.js'
import { useParams } from 'react-router-dom';


const CreateUpdate = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [ sidebar, setSidebar ] = useState(false);
    const module = 'news'
    const { moduleId } = useParams();

    const toggleSidebar = (val) => setSidebar(val)

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CreateEditHeader module={module} moduleId={moduleId} />
            }
            content={
                <CreateUpdateForm toggleSidebar={toggleSidebar} />
            }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateUpdate;

