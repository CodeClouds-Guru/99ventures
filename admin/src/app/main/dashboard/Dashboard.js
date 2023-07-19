import { styled } from '@mui/material/styles';
// import { useTranslation } from 'react-i18next';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FusePageCarded from '@fuse/core/FusePageCarded/FusePageCarded';
// import DemoContent from '@fuse/core/DemoContent';
import DashboardContent from './DashboardContent';
import { Typography } from '@mui/material';
import { selectUser } from 'app/store/userSlice';
import { useSelector } from 'react-redux';

function DashboardPage(props) {
    // const { t } = useTranslation('dashboardPage');
    const user = useSelector(selectUser);
    return (
        <FusePageSimple
            header={
                <div className="p-24">
                    <Typography variant="h5" className="font-bold">Welcome { user.first_name }!</Typography>
                </div>
            }
            content={
                <div className="p-10">
                    <DashboardContent />
                </div>
            }
            scroll="page"
        />
    );
}

export default DashboardPage;
