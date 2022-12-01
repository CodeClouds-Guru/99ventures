import { useParams } from 'react-router-dom';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import List from '../crud/list/List';
import CommonHeader from './CommonHeader';
import { useState } from 'react';
import { Box } from '@mui/material';


const Submodule = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const params = useParams();
    const moduleId = params.moduleId;
    const module = params.submodule;
    const [clause, setClause] = useState({member_id: moduleId})
    
    if(module == 'Withdraws'){
        setClause({...clause, type: "withdraw"});
    }


    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <CommonHeader module={module} />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                    <List module="member-transactions"
                        where={ clause }
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

export default Submodule;