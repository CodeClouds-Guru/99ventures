import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '../crud/list/List';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DragHandleIcon from '@mui/icons-material/DragIndicator';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import { Container, Draggable } from "react-smooth-dnd";
import axios from 'axios';
import { arrayMoveImmutable } from "array-move";
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}            
            {...other}
        >
        {value === index && (
            <Box sx={{ p: 3 }} className="h-3xl min-h-3xl max-h-3xl">
                {children}
            </Box>
        )}
        </div>
    );
}
  
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const MembershipList = () => {
    const dispatch = useDispatch();
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [value, setValue] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [tiers, setTiers] = React.useState([]);


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    React.useEffect(()=>{
        getMembershipLevelData()
    }, []);

    const getMembershipLevelData = () => {
        axios.get(`membership-tiers?type=chronology_update`)
        .then((response) => {
            if (response.data.results.result) {
                const record = response.data.results.result;
               setTiers(record.data)
            } else {
                dispatch(showMessage({ variant: 'error', message: response.data.results.message }));
            }
        })
        .catch((error) => {
            console.log(error)
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
        })
    }

    const updateMembershipLevel = () => {
        const chronology_list = tiers.map((row, indx)=> {
            return {
                id: row.id,
                chronology: indx+1
            }
        });
        setLoading(true);
        const params = {
            type: 'chronology_update',
            chronology_list
        }
        axios.post(jwtServiceConfig.membershipUpdate, params)
            .then((response) => {
                setLoading(false);
                if (response.data.results.status) {                 
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));

                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                console.log(error)
                setLoading(false)
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }))
            })
    }

    const onDrop = ({ removedIndex, addedIndex }) => {
        setTiers(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };
    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Membership Tiers" {...a11yProps(0)} />
                    <Tab label="Configurations" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <FusePageCarded
                    content={
                        <List module="membership-tiers"
                            editable={ true }
                            addable={ true }
                            deletable={ true }
                            moduleHeading={ false }
                            customHeading="Membership Tiers"
                        />
                    }
                    scroll={isMobile ? 'normal' : 'page'}
                />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <FusePageCarded 
                    content={
                        <>
                            <motion.div
                                className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16 py-16"
                                initial={{ x: -10 }}
                                animate={{ x: 0, transition: { delay: 0.3 } }}
                            >
                                <Typography variant="h5" className="font-extrabold tracking-tight capitalize">Configurations</Typography>
                            </motion.div>
                        
                            <div className='justify-center flex p-16' >                            
                                <div className='flex w-1/2 flex-col'>
                                    <div className='border-dashed border-2 border-gray-700 w-full p-16' style={{minHeight: '30rem'}}>
                                        <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onDrop}>
                                            {
                                                tiers.length ? tiers.map(row => {
                                                    return (
                                                        <Draggable key={Math.random()}>
                                                            <div className='p-20 bg-gray-50 mb-10 rounded shadow-md flex'>
                                                                <div className="drag-handle mr-10 cursor-move">
                                                                    <DragHandleIcon/> 
                                                                </div> 
                                                                {row.name}
                                                            </div>
                                                        </Draggable>
                                                    )
                                                }) : ''
                                            }
                                        </Container>
                                    </div>
                                    <div className='mt-24 w-full text-center'>
                                        <LoadingButton color="primary" className="w-1/4" loading={loading} variant="contained" onClick={updateMembershipLevel}>Save</LoadingButton>
                                    </div>
                                </div>
                            </div>       
                        </>              
                    } 
                    scroll="normal" 
                />
            </CustomTabPanel>
        </Box>
    )
}

export default MembershipList