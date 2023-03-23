import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import PageHeader from './PageHeader';
import AlertsContent from './AlertsContent';

const Alerts = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Alerts';
    const { moduleId } = useParams();

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={module} button="alerts" />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                    <AlertsContent />
                </Box>
            }
            rightSidebarOpen={false}
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default Alerts;