import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useState } from 'react';
import CreateEditForm from './CreateEditForm';
import History from './History';
import CreateEditHeader from '../crud/create-edit/CreateEditHeader';
import { useParams } from 'react-router-dom';

const CreateEdit = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [ sidebar, setSidebar ] = useState(false);
    const module = 'layouts';
    const { moduleId } = useParams();

    const toggleSidebar = (val) => setSidebar(val)

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CreateEditHeader module={module} moduleId={moduleId} />
            }
            content={
                <CreateEditForm toggleSidebar={toggleSidebar} />
            }
            rightSidebarOpen={ sidebar }
            rightSidebarContent={ <History toggleSidebar={toggleSidebar} />}
            rightSidebarWidth={400}
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateEdit;

