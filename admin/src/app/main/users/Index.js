import FusePageCarded from '@fuse/core/FusePageCarded';
import MainHeader from 'app/shared-components/MainHeader';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MemberDetails from './MemberDetails'

const UserDetails = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Users'
 

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="layouts" />
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