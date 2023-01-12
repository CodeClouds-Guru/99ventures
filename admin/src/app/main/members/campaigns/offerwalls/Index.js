import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import MainHeader from 'app/shared-components/MainHeader';
import List from '../../../crud/list/List';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Offerwalls';
    const { moduleId } = useParams();
 
    return (
        <FusePageCarded
            className="min-h-0"
            sx={{ '& .FusePageCarded-header': {flexDirection: 'column'} }}
            header={
                <MainHeader module={module} backUrl={ (moduleId && !isNaN(moduleId)) ? '/app/campaigns' : '' } />
            }
            content={
                <Box className="sm:p-16 lg:p-16 md:p-16 xl:p-16 " >
                    <List
                        params={ (moduleId && !isNaN(moduleId)) ? {report: 1, campaign_id: moduleId} : {}}
                        module="offer-walls"
                        moduleHeading={ false }
                        customAddURL={`/app/campaigns/${moduleId}/offerwalls/create`}
                        where=""
                        addable={ (moduleId && !isNaN(moduleId)) ? true : false }
                        editable={ true }
                        deletable={ (moduleId && !isNaN(moduleId)) ? true : false }
                    />
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
    )
}

export default Index;