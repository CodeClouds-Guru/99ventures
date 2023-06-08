import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { Paper, Input, IconButton } from '@mui/material';
import Chart from 'react-apexcharts';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import CampaignDetails from "../CampaignDetails";
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import moment from 'moment';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const labels = {
    a: 'Condition Met (Postback Triggered)',
    b: 'Condition Met (Postback Not Triggered)',
    c: 'Condition Met (Reversed)',
    d: 'Condition Not Met'
};

const PieChart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { campaignId } = useParams();
    const [where, setWhere] = useState({});
    const [chartState, setChartState] = useState({
        series: [0, 0, 0, 0],
        options: {
            labels: Object.values(labels),
            chart: {
                width: 500,
                type: 'pie',
            },
            colors: ['#2e7d32', '#ed6c02', '#1e293b', '#f44336'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        }
    });
    const [campaignDetails, setCampaignDetails] = useState({});
    const [datepickerStatus, setDatepickerStatus] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });
    const [showMsg, setShowMsg] = useState(true);
    const seriesData = {
        a: 0,
        b: 0,
        c: 0,
        d: 0
    };

    useEffect(() => {
        getDetails();
    }, [where]);

    const getDetails = () => {
        const params = {
            report: 1,
            page: 1,
            show: 9999,
            where
        };

        axios.get(jwtServiceConfig.getSingleCampaign + '/' + campaignId, { params })
            .then(res => {
                if (res.data.results.status && res.data.results.result.data.length) {
                    const response = res.data.results.result;
                    setCampaignDetails(response.campaign_details);
                    response.data.map(data => {
                        switch (data.campaign_status) {
                            case 0:
                                seriesData.a += 1;
                                break;
                            case 1:
                                seriesData.b += 1;
                                break;
                            case 2:
                                seriesData.c += 1;
                                break;
                            case 3:
                                seriesData.d += 1;
                                break;
                            default:

                        }
                    });

                    setChartState({
                        ...chartState,
                        series: Object.values(seriesData)
                    });
                    setShowMsg(false);
                }
            })
            .catch(errors => {
                dispatch(showMessage({ variant: 'error', message: errors.message }));
                navigate('/app/campaigns');
            });
    }

    const dateRangeSelected = (val) => {
        setDatepickerStatus(!datepickerStatus)
        setDateRange({
            startDate: moment(val.startDate),
            endDate: moment(val.endDate)
        });
        setWhere({
            created_at: [moment(val.startDate), moment(val.endDate).add(1, 'day')]
        });
    }

    const handleClearDateRange = () => {
        setDateRange({
            startDate: null,
            endDate: null
        });
        setWhere({});
    }

    return (
        <div>
            {
                showMsg ? (
                    <div className="flex justify-center items-center flex-col py-200">
                        <IconButton color="primary" aria-label="Warning" component="span" sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)', width: '150px', height: '150px' }}>
                            <FuseSvgIcon className="text-48" size={80} color="action">material-outline:warning_amber</FuseSvgIcon>
                        </IconButton>
                        <p>No records there.</p>
                    </div>
                ) : (
                    <>
                        <div className='flex mb-16 w-full justify-between items-center w-full'>
                            <CampaignDetails campaign={campaignDetails} />
                            <Paper
                                component={motion.div}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                                className="flex items-center xl:w-1/5 sm:w-1/3  space-x-8 px-16 rounded-full border-1 shadow-0"
                                sx={{ '& .MuiBox-root.muiltr-79elbk': { top: '110px', right: '15%' } }}
                            >
                                <FuseSvgIcon className="text-48" size={24} color="disabled">feather:calendar</FuseSvgIcon>
                                <Input
                                    label="Select a date range"
                                    className="datepicker--input"
                                    placeholder="Select daterange"
                                    disabled
                                    disableUnderline
                                    size="small"
                                    onClick={() => setDatepickerStatus(!datepickerStatus)}
                                    value={
                                        dateRange && dateRange.startDate
                                            ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}`
                                            : ''
                                    }
                                />
                                {(dateRange && dateRange.startDate) && <FuseSvgIcon className="cursor-pointer text-48" size={24} color="action" onClick={handleClearDateRange}>material-outline:close</FuseSvgIcon>}
                            </Paper>
                        </div>
                        <div className="date-range-wrapper">
                            <DateRangePicker
                                wrapperClassName="filter-daterange-picker"
                                open={datepickerStatus}
                                toggle={() => setDatepickerStatus(!datepickerStatus)}
                                onChange={dateRangeSelected}
                            />
                        </div>
                        <div className="donut w-full flex justify-center">
                            <Chart options={chartState.options} series={chartState.series} type="pie" width={600} />
                        </div>
                    </>
                )
            }



        </div>
    );
}

export default PieChart;