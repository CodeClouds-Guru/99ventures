import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import MainHeader from 'app/shared-components/MainHeader';
import List from '../../../crud/list/List';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'offer-walls';
    const { moduleId } = useParams();

    return (
        <List
            params={(moduleId && !isNaN(moduleId)) ? { report: 1, campaign_id: moduleId } : {}}
            module={module}
            customAddURL={`/app/campaigns/${moduleId}/offerwalls/create`}
            where=""
            addable={(moduleId && !isNaN(moduleId)) ? true : false}
            editable={true}
            deletable={(moduleId && !isNaN(moduleId)) ? true : false}
        />
    )
}

export default Index;