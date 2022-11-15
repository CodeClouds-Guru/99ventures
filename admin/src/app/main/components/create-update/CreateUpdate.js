import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import { useState } from 'react';
import CreateUpdateForm from './CreateUpdateForm';
import History from './History';


const CreateUpdate = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [ sidebar, setSidebar ] = useState(false);
    const module = 'Components'

    const toggleSidebar = () => setSidebar(!sidebar)

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="components" />
            }
            content={
                <CreateUpdateForm toggleSidebar={toggleSidebar} />
            }
            rightSidebarOpen={ sidebar }
            rightSidebarContent={ <History toggleSidebar={toggleSidebar} />}
            rightSidebarWidth={400}
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateUpdate;

