import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MemberDetails from './MemberDetails'
import PageHeader from './PageHeader';

const UserDetails = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Members'
 

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={module}  button="profile" />
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