import { TextField, IconButton, Tooltip, Card, CardContent, OutlinedInput, InputAdornment, FormControl } from '@mui/material';
import moment from 'moment';
import { useState, useEffect } from 'react';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useDispatch } from 'react-redux';
import { DateRangePicker } from "mui-daterange-picker";
import axios from "axios";
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CardPanel from './cards-charts/CardPanel';
import TicketsChart from './cards-charts/TicketsChart';
import LoginPerDay from './cards-charts/LoginPerDay';
import CompletedSurveyChart from './cards-charts/CompletedSurveyChart';
import MembersChart from './cards-charts/MembersChart';
import BestPerformingSurveys from './cards-charts/BestPerformingSurveys';
import BestPerformers from './cards-charts/BestPerformers';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const types = [
    'completed_surveys',
    'login_per_day',
    'members',
    'open_vs_closed_tickets',
    'top_surveys',
    'top_members'
];

const DashboardContent = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [daterangeLessData, setDaterangeLessData] = useState({});
    const [completedSurveys, setCompletedSurveys] = useState({});
    const [ticketsChart, setTicketsChart] = useState({});
    const [loginPerDay, setLoginPerDay] = useState({});
    const [membersChart, setMembersChart] = useState({});
    const [bestPerformingSurveys, setBestPerformingSurveys] = useState({});
    const [bestPerformers, setBestPerformers] = useState({});
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [param, setParam] = useState({
        from: dateRange.startDate,
        to: dateRange.endDate
    });

    const dateRangeSelected = (val) => {
        setOpen(!open)
        updateDate(
            moment(val.startDate),
            moment(val.endDate),
        )
    }
    const constructParam = () => {
        setParam({
            from: moment(dateRange.startDate),
            to: moment(dateRange.endDate)
        })
    }
    useEffect(() => {
        getDaterangeLessReport();
    }, [])

    useEffect(() => {
        for(let type of types){
            getDashboardData({
                type,
                from: param.from,
                to: param.to
            })
        }
    }, [param])

    const clearFilter = () => {
        setOpen(false)
        updateDate(
            moment().subtract(7, 'd').startOf('day'),
            moment()
        )
    }

    const updateDate = (startDate, endDate) => {
        setDateRange({
            startDate: startDate,
            endDate: endDate,
        });
        setParam({
            from: startDate.startOf('day'),
            to: endDate.endOf('day')
        });
    }

    const getDaterangeLessReport = () => {
        axios.get(jwtServiceConfig.dashboardReport + '?type=count_report').then((res) => {
            setDaterangeLessData(res.data.results)
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getCompletedSurveys = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=completed_surveys&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('survey_names') && (res.data.results).hasOwnProperty('survey_count')) {
                setCompletedSurveys(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getLoginPerDay = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=login_per_day&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('names') && (res.data.results).hasOwnProperty('values')) {
                setLoginPerDay(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getMembersChart = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=members&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('names') && (res.data.results).hasOwnProperty('values')) {
                setMembersChart(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getOpenVsCloseTickets = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=open_vs_closed_tickets&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('names') && (res.data.results).hasOwnProperty('values')) {
                setTicketsChart(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getBestPerformingSurveys = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=top_surveys&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('names')) {
                setBestPerformingSurveys(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getBestPerformers = () => {
        axios.get(jwtServiceConfig.dashboardReport + `?type=top_members&from=${param.from}&to=${param.to}`).then((res) => {
            if ((res.data.results).hasOwnProperty('names')) {
                setBestPerformers(res.data.results);
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }

    /**
     * Get Dashboard report's data
     * @param {*} payload 
     */
    const getDashboardData = (payload) => {
        axios.get(jwtServiceConfig.dashboardReport, {params: payload}).then((res) => {
            const results = res.data.results;
            if(payload.type === 'completed_surveys'){
                if (results.hasOwnProperty('survey_names') && results.hasOwnProperty('survey_count')) {
                    setCompletedSurveys(results);
                }
            } 
            else if(payload.type === 'login_per_day') {
                if (results.hasOwnProperty('names') && results.hasOwnProperty('values')) {
                    setLoginPerDay(results);
                }
            }
            else if(payload.type === 'members') {
                if (results.hasOwnProperty('names') && results.hasOwnProperty('values')) {
                    setMembersChart(results);
                }
            }
            else if(payload.type === 'open_vs_closed_tickets') {
                if (results.hasOwnProperty('names') && results.hasOwnProperty('values')) {
                    setTicketsChart(results);
                }
            }
            else if(payload.type === 'top_surveys') {
                if (results.hasOwnProperty('names')) {
                    setBestPerformingSurveys(results);
                }
            }
            else if(payload.type === 'top_members') {
                if (results.hasOwnProperty('names')) {
                    setBestPerformers(results);
                }
            }
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }

    return (
        <>
            <CardPanel surveys={daterangeLessData.no_of_surveys} users={daterangeLessData.no_of_members} verifiedUsers={daterangeLessData.no_of_verified_members} completedSurveys={daterangeLessData.completed_surveys} withdrawn={daterangeLessData.total_withdrawn} />
                    
            <div className="flex w-full ml-5 my-32 justify-center text-center items-center relative dashboard-datepicker">
                {
                    open && (
                        <DateRangePicker
                            open={open}
                            toggle={() => { setOpen(!open) }}
                            onChange={dateRangeSelected}
                            className="daterangepicker-filter"
                            maxDate={moment().endOf('day').toDate()}
                            initialDateRange={{
                                startDate: dateRange.startDate.toDate(),
                                endDate: dateRange.endDate.toDate(),
                            }}
                        />
                    )
                }

                <FormControl variant="outlined" className="xl:w-3/12 lg:w-4/12 md:w-2/6 mr-10">
                    <OutlinedInput
                        id="outlined-adornment-datepicker"
                        type="text"
                        readOnly
                        onClick={() => { setOpen(!open) }}                                
                        startAdornment={
                            <InputAdornment position="start">
                                <IconButton
                                aria-label="toggle password visibility"
                                edge="start"
                                >
                                    <FuseSvgIcon className="text-48 cursor-pointer flex justify-start" size={18} color="disabled">feather:calendar</FuseSvgIcon>
                                </IconButton>
                            </InputAdornment>
                        }												
                        placeholder="Select a date range"
                        value={dateRange ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}` : ''}
                    />
                </FormControl>

                <Tooltip title="Clear Filter" placement="right">
                    <div>
                        <IconButton
                            color="primary"
                            aria-label="Clear Filter"
                            component="label"
                            onClick={clearFilter}
                        >
                            <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:refresh</FuseSvgIcon>
                        </IconButton>
                    </div>
                </Tooltip>
            </div>

            <div className="flex flex-wrap w-full justify-between">
                <div className="flex flex-wrap w-full lg:w-2/3 justify-between">
                    <LoginPerDay loginPerDay={loginPerDay} />
                    <CompletedSurveyChart completedSurveys={completedSurveys} />
                    <MembersChart membersChart={membersChart} />
                    <TicketsChart ticketsChart={ticketsChart} />
                </div>
                <div className="flex flex-wrap w-full lg:w-1/3 justify-between">
                    <BestPerformingSurveys bestPerformingSurveys={bestPerformingSurveys} />
                    <BestPerformers bestPerformers={bestPerformers} />
                </div>
            </div>                
        </>
    )

}
export default DashboardContent;