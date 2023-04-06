import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ShoutboxContent from './ShoutboxContent';

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

function ShoutboxConfigurations(props) {
    return (
        <Root
            content={
                <div className="p-24" style={{ width: '100%' }}>
                    <ShoutboxContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default ShoutboxConfigurations;
