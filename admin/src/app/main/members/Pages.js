import { Box } from '@mui/material';
import axios from 'axios'
import { useParams } from 'react-router-dom';
import PageHeader from './PageHeader';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import IPLogs from './IPlogs';
import MemberTransaction from './MemberTransaction';
import Withdraws from './Withdraws';
import Downline from './Downline';
import AlertsContent from './AlertsContent';

const Pages = ()=>{
    const [ username, setUsername ] = useState('');
    const [ userdata, setUserdata ] = useState({});
    const dispatch = useDispatch();
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const { moduleId } = useParams();
    const { module } = useParams();

    const getMember = ()=> {
        axios.get(jwtServiceConfig.getSingleMember + '/' + moduleId)
            .then(res => {
                const result = res.data.results.data;
                setUsername(result.username);
                setUserdata(result);
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.message }));
            })
    }

    const dynamicComponent = () => {
        if(module === 'history'){
            return <MemberTransaction/>
        } else if(module === 'downline'){
           return <Downline/>
        } else if(module === 'security'){
            return <IPLogs/>
        } else if(module === 'withdraws'){
            return <Withdraws/>
        } else if(module === 'alerts'){
            return <AlertsContent userdata={userdata} getmember={getMember}/>
        }
    }

    useEffect(()=>{
        getMember();
    }, []);

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <PageHeader module={username} button={module} />
            }
            content={
                <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex flex-col w-full" >
                    {dynamicComponent()}
                </Box>
            }
            rightSidebarOpen={false}
            scroll={isMobile ? 'normal' : 'content'}
        />
    )
}

export default Pages