import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import CreateEditHeader from '../../../crud/create-edit/CreateEditHeader';
import MainHeader from 'app/shared-components/MainHeader';
import List from '../../../crud/list/List';
import { useParams } from 'react-router-dom';

const Index = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Offerwalls';
    const { moduleId } = useParams();

    return (
        <FusePageCarded
            className="min-h-0"
            sx={{ '& .FusePageCarded-header': {flexDirection: 'column'} }}
            header={
                <MainHeader module={ module } />
            }
            content={
                <Box className="sm:p-16 lg:p-16 md:p-16 xl:p-16 " >
                    <List
                        module="campaigns"
                        moduleHeading={ false }
                        customAddURL={`/app/campaigns/${moduleId}/offerwalls/create`}
                        where=""
                    />
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
    )
}

export default Index;