import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import List from '../../../crud/list/List';
import { useParams } from 'react-router-dom';

const Index = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'offer-walls';
    const { moduleId } = useParams();

    return (
        <List
            params={(moduleId && !isNaN(moduleId)) ? { report: 1, campaign_id: moduleId } : {}}
            module={module}
        />
    )
}

export default Index;