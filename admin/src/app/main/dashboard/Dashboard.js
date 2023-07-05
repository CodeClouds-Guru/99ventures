import { styled } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FusePageCarded from '@fuse/core/FusePageCarded/FusePageCarded';
// import DemoContent from '@fuse/core/DemoContent';
import DashboardContent from './DashboardContent';

const Root = styled(FusePageCarded)(({ theme }) => ({
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
                <div className="p-10">
                    <DashboardContent />
                </div>
            }
            scroll="content"
        />
    );
}

export default DashboardPage;
