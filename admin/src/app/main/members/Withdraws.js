import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import List from '../crud/list/List';
import { useParams } from 'react-router-dom';
import PageHeader from './PageHeader';


const UserDetails = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Withdraws';
    const { moduleId } = useParams();
 
    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={module} button="withdraws" />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                    <List module="member-transactions"
                        where={{member_id: moduleId, type: "withdraw"}}
                        editable={ false }
                        addable={ false }
                        deletable={ false }
                    />
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default UserDetails;