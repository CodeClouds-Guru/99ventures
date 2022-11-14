import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import { useEffect } from 'react';
import CreateEditForm from './CreateEditForm';
import History from './History';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarStatus, setRevisionData } from 'app/store/layout'
import { useParams } from 'react-router-dom';


const CreateEdit = () => {
    const dispatch = useDispatch();
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const selectSidebarStatus = useSelector(state=> state.layout.layout_sidebar);
    const selectRevisionCount = useSelector(state=> state.layout.revisions_count);
    const { moduleId } = useParams();
    const module = 'Layouts'

    useEffect(()=>{
        dispatch(setSidebarStatus(false));
        dispatch(setRevisionData([]));
    }, [])

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="settings" />
            }
            content={
                <CreateEditForm />
            }
            rightSidebarOpen={ (moduleId == 'create' ) ? false : (selectSidebarStatus && selectRevisionCount > 0)  }
            rightSidebarContent={ <History />}
            rightSidebarWidth={400}
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateEdit;

