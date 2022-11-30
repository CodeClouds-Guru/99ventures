import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MemberDetails from './MemberDetails'
import CreateEditHeader from '../crud/create-edit/CreateEditHeader';

const UserDetails = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'members'
 

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CreateEditHeader module={module}  moduleId={ 1 } />
            }
            content={
                <MemberDetails />
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default UserDetails;