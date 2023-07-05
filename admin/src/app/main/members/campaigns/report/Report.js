import CampaignDetails from "../CampaignDetails";
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { Box, Tooltip, IconButton, MenuItem, Select, FormControl, InputLabel, Stack, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import ReportList from './ReportList';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';


const UsersTracking = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ campaignDetails, setCampaignDetails ] = useState({});
    const [ listData, setListData ] = useState({});
    const [ filter, setFilter ] = useState('all');
    const { campaignId } = useParams(); 
    const [ order, setOrder ] = useState({});
    const [ page, setPage ] = useState(0);
	const [ rowsPerPage, setRowsPerPage ] = useState(10);

    useEffect(()=>{
        getDetails();
    }, [filter, order, page, rowsPerPage]);

    const getDetails = () => {
        const params = {
            report: 1,
            page: page+1,
            show: rowsPerPage
        };
        if('all' !== filter) {
            params.campaign_status = filter
        }
        if(order.id && order.direction) {
            params.sort = order.id
			params.sort_order = order.direction
        }
        sendRequest(params, '');
    }
    
    const handleFilter = (e) => {
        setFilter(e.target.value);
    }

    const handleRequestSort = (e, property) => {
		const id = property;
		let direction = 'desc';
		if (order.id === property && order.direction === 'desc') {
			direction = 'asc';
		}
		setOrder({
			direction,
			id,
		});
	}

    const handleChangePage = (event, value) => {
		setPage(value);
	}

	const handleChangeRowsPerPage = (event) => {
		setPage(0);
		setRowsPerPage(event.target.value);
	}

    const hanldeExport = () => {
        const params = {
            export_csv: 1,
            report:1
        }
        if('all' !== filter) {
            params.campaign_status = filter
        }
        sendRequest(params, 'csv_download');
    }

    const sendRequest = (params, mode) => {
        axios.get(jwtServiceConfig.getSingleCampaign + '/' + campaignId, { params })
        .then(res => {
            if(mode == 'csv_download') {
                downloadCSV(res.data)
            }
            else if(res.data.results) {
                const result = res.data.results;
                setListData(result);
                setCampaignDetails(result.result.campaign_details);
            }   
        })
        .catch(errors => {
            console.log(errors)
            dispatch(showMessage({ variant: 'error', message: errors.message}));
            // navigate('/app/campaigns')
        })
    }

    const downloadCSV = (data) => {
        const a = document.createElement('a');
        a.href = `data:text/csv;charset=utf-8,${escape(data)}`;
        a.download = 'campaign_report_' + Date.now();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <>
            <div className="xl:px-0 lg:px-16 md:px-16 sm:px-10">
                <div className='flex mb-16 w-full justify-between items-center'>
                    <CampaignDetails campaign={ campaignDetails } />
                    <div className="flex">
                        <FormControl sx={{ minWidth: 300 }} size="small" className="mr-5">
                            <InputLabel id="demo-select-small">Filter</InputLabel>
                            <Select
                                labelId="demo-select-small"
                                id="demo-select-small"
                                value={ filter }
                                label="Filter"
                                onChange={ handleFilter }
                            >
                                <MenuItem value='all'>All</MenuItem>
                                <MenuItem value={1}>Condition Met (Postback Triggered)</MenuItem>
                                <MenuItem value={2}>Condition Met (Postback Not Triggered)</MenuItem>
                                <MenuItem value={3}>Condition Met (Reversed)</MenuItem>
                                <MenuItem value={0}>Condition Not Met</MenuItem>
                            </Select>
                        </FormControl>
                        {
                            (listData.result && listData.result.data.length) ? (
                                <div>
                                    <Tooltip title="Export to CSV">
                                        <IconButton color="primary" aria-label="Export to CSV" component="label" onClick={ hanldeExport }>
                                            <FuseSvgIcon className="text-48" size={28} color="action">feather:download</FuseSvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            ) : ''
                        }
                    </div>
                </div>
                <Stack direction="row" spacing={1} className="flex-wrap py-10 justify-center">
                    <Chip label="Condition Met (Postback Triggered)" size="small" color="success" />
                    <Chip label="Condition Met (Postback Not Triggered)" size="small" color="warning" />
                    <Chip label="Condition Met (Reversed)" size="small" color="primary" />
                    <Chip label="Condition Not Met" size="small" color="error" sx={{ '@media(max-width: 900px)': {marginTop: '5px !important'}}} />
                </Stack>
            </div>
            <ReportList 
                page={page}
                rowsPerPage={rowsPerPage}
                order={order} 
                result={listData} 
                handleRequestSort={handleRequestSort}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </>
        
    )
}

export default UsersTracking;
