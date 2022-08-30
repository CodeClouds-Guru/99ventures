import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ProfileContent from './ProfileContent';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
    },
    '& .FusePageSimple-toolbar': {},
    '& .FusePageSimple-content': {},
    '& .FusePageSimple-sidebarHeader': {},
    '& .FusePageSimple-sidebarContent': {},
}));

function Profile(props) {
    return (
        <Root
            // header={
            //     <div className="p-24" style={{ width: '100%' }}>
            //         <h4>COMPANY AND SITE SELECTION</h4>
            //     </div>
            // }
            content={
                <div className="p-24" style={{ width: '100%' }}>
                    <ProfileContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default Profile;
