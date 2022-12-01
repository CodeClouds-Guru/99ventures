import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import CommonHeader from './CommonHeader';
import List from '../crud/list/List';
import { useParams } from 'react-router-dom';


const MemberTransaction = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'History';
    const { moduleId } = useParams();
 
    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CommonHeader module={module} />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                    <List module="member-transactions"
                        where={{member_id: moduleId}}
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


export default MemberTransaction;