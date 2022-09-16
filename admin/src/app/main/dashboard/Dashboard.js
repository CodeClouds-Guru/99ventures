import { styled } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DemoContent from '@fuse/core/DemoContent';

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

function DashboardPage(props) {
    // const { t } = useTranslation('dashboardPage');

    return (
        <Root
            header={
                <div className="p-24">
                    {/* <h4>{t('TITLE')}</h4> */}
                    <h4>Dashboard</h4>
                </div>
            }
            content={
                <div className="p-24">
                    <DemoContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default DashboardPage;
