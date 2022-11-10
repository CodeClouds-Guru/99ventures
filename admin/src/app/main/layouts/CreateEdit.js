import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import { useState } from 'react';
import CreateEditForm from './CreateEditForm';
import History from './History';

const CreateEdit = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [ sidebarStatus, setSidebarStatus ] = useState(false)
    const module = 'Layouts'

    const showSidebar = () => {
        setSidebarStatus(!sidebarStatus)
    }

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="settings" />
            }
            content={
                <CreateEditForm showSidebar={showSidebar} sidebarStatus={ sidebarStatus } />
            }
            rightSidebarOpen={ sidebarStatus }
            rightSidebarContent={ <History />}
            rightSidebarWidth={400}
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateEdit;

