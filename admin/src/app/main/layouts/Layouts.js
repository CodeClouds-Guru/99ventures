import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import LayoutsContent from './LayoutsContent';

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

function Layouts(props) {
    return (
        <Root
            content={
                <div className="p-24" style={{ width: '100%' }}>
                    <LayoutsContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default Layouts;
