import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import CampaignsContent from './CampaignsContent';

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

function Campaigns(props) {
    return (
        <Root
            content={
                <div className="" style={{ width: '100%' }}>
                    <CampaignsContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default Campaigns;
