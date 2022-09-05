import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import EmailTemplateContent from './EmailTemplateContent';
import EmailTemplateHeader from './EmailTemplateHeader';

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

function EmailTemplate(props) {
    return (
        <Root
            header={
                // <div className="p-24" style={{ width: '100%' }}>
                //     <h2>Email Template</h2>
                // </div>
                <EmailTemplateHeader />
            }
            content={
                <div className="p-24" style={{ width: '100%' }}>
                    <EmailTemplateContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default EmailTemplate;
