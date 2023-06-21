import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box } from '@mui/material';
import List from '../../crud/list/List';
import WithdrawalRequestsHeader from './WithdrawalRequestsHeader';
import axios from 'axios';
import { useState, useEffect } from 'react';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';

const Index = (props) => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'withdrawal-requests';
    const [withdrawalTypes, setWithdrawalTypes] = useState([]);
    const [withdrawalTypeID, setWithdrawalTypeID] = useState(null);
    const [listElem, setListElem] = useState('');

    useEffect(() => {
        getWithdrawalTypes();
    }, []);
    useEffect(() => {
        !withdrawalTypeID ? '' : setListElem(<List module={module}
            where={{ withdrawal_type_id: withdrawalTypeID, status: 'pending' }}
            editable={false}
            addable={false}
            deletable={false}
            actionable={true}
        />)
    }, [withdrawalTypeID]);

    const getWithdrawalTypes = () => {
        axios.get(jwtServiceConfig.getWithdrawalRequests, { params: { type: 'withdrawal-types' } }).then((response) => {
            if (response.data.results.result.data) {
                setWithdrawalTypes(response.data.results.result.data)
            } else {
                console.error('Failed to fetch Withdrawal Types');
            }
        });
    }

    const singleWithdrawalTypeID = (id) => {
        setWithdrawalTypeID(id);
        setListElem('');
    }
    return (
        <>
            <FusePageCarded
                className="sm:px-20"
                header={
                    <WithdrawalRequestsHeader withdrawalTypesProps={withdrawalTypes} singleWithdrawalTypeID={singleWithdrawalTypeID} />
                }
                content={
                    <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                        {listElem}
                    </Box>
                }
                rightSidebarOpen={false}
                scroll={isMobile ? 'normal' : 'content'}
            />
        </>
    );
}

export default Index;