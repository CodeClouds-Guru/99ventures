import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import CampaignDetails from "./CampaignDetails";
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { Box, Tooltip, IconButton, MenuItem, Select, FormControl, InputLabel, Stack, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import List from "../../crud/list/List";
import axios from 'axios'

const UsersTracking = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const [ campaignDetails, setCampaignDetails] = useState({});
    const [ listData, setListData] = useState([]);
    const { campaignId } = useParams(); 
    
    // useEffect(()=>{
    //     getDetails();
    // }, []);

    const getDetails = () => {
        axios.post(jwtServiceConfig.getSingleCampaign + '/' + campaignId + '?report=1')
        .then(res => {
            if (res.data.results) {
                const result = res.data.results;
                setCampaignDetails(result.result);
            }
        })
        .catch(errors => {
            dispatch(showMessage({ variant: 'error', message: errors.message}));
        })
    }
    
    const handleFilter = (e) => {
        console.log(e.target.value)
    }

    const hanldeExport = () => {

    }

    return (
        <FusePageCarded
            className="min-h-0"
            sx={{ '& .FusePageCarded-header': {flexDirection: 'column'} }}
            header={
                <div className="xl:px-0 lg:px-16 md:px-16 sm:px-10">
                    <MainHeader module="Reports" backUrl="/app/campaigns" />
                    <div className='flex mb-16 w-full justify-between items-center'>
                        <CampaignDetails campaign={ campaignDetails } />
                        <div className="flex">
                            <FormControl sx={{ minWidth: 120 }} size="small" className="mr-5">
                                <InputLabel id="demo-select-small">Filter</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={20}
                                    label="Filter"
                                    onChange={ handleFilter }
                                >
                                    <MenuItem value={10}>All</MenuItem>
                                    <MenuItem value={20}>Condition Met (Postback Triggered)</MenuItem>
                                    <MenuItem value={30}>Condition Met (Postback Not Triggered)</MenuItem>
                                    <MenuItem value={30}>Condition Met (Reversed)</MenuItem>
                                    <MenuItem value={30}>Condition Not Met</MenuItem>
                                </Select>
                            </FormControl>
                            <div>
                                <Tooltip title="Export to CSV">
                                    <IconButton color="primary" aria-label="Export to CSV" component="label" onClick={ hanldeExport }>
                                        <FuseSvgIcon className="text-48" size={28} color="action">feather:download</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <Stack direction="row" spacing={1} className="flex-wrap py-10 justify-center">
                        <Chip label="Condition Met (Postback Triggered)" size="small" color="success" />
                        <Chip label="Condition Met (Postback Not Triggered)" size="small" color="warning" />
                        <Chip label="Condition Met (Reversed)" size="small" color="primary" />
                        <Chip label="Condition Not Met" size="small" color="error" className="sm:mt-10" />
                    </Stack>
                </div>
            }
            content={
                <Box className="sm:p-16 lg:p-16 md:p-16 xl:p-16 " >
                    {/* <List
                        module="campaigns"
                        moduleHeading={false}
                        searchable={false}
                        addable={false}
                    /> */}
                </Box>
            }
            rightSidebarOpen={ false }
            scroll={isMobile ? 'normal' : 'content'}
        />
    )
}

export default UsersTracking;
