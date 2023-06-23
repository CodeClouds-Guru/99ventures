import { TextField, IconButton, Tooltip, Card, CardContent } from '@mui/material';
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

const DashboardContent = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [reRenderPicker, setReRenderPicker] = useState(true);
    const [daterangeLessData, setDaterangeLessData] = useState({});
    const [completedSurveys, setCompletedSurveys] = useState({});
    const [ticketsChart, setTicketsChart] = useState({});
    const [loginPerDay, setLoginPerDay] = useState({});
    const [membersChart, setMembersChart] = useState({});
    const [bestPerformingSurveys, setBestPerformingSurveys] = useState({});
    const [bestPerformers, setBestPerformers] = useState({});
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day').toDate(),
        endDate: moment().toDate(),
    });
    const [param, setParam] = useState({
        from: moment(dateRange.startDate),
        to: moment(dateRange.endDate)
    })

    const toggle = () => setOpen(!open);

    const dateRangeSelected = (val) => {
        toggle();
        updateDate(
            moment(val.startDate),
            moment(val.endDate)
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
        getCompletedSurveys();
        getLoginPerDay();
        getMembersChart();
        getOpenVsCloseTickets();
        getBestPerformingSurveys();
        getBestPerformers();
    }, [param])
    const clearFilter = () => {
        setReRenderPicker(false)
        setOpen(false)
        updateDate(
            moment().subtract(7, 'd').startOf('day'),
            moment()
        )
    }

    const updateDate = (startDate, endDate) => {
        setDateRange({
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
        });
        setParam({
            from: startDate,
            to: endDate
        })
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

    return (
        <div>
            <CardPanel surveys={daterangeLessData.no_of_surveys} users={daterangeLessData.no_of_members} verifiedUsers={daterangeLessData.no_of_verified_members} completedSurveys={daterangeLessData.completed_surveys} withdrawn={daterangeLessData.total_withdrawn} />
            <Card className="w-full m-5 border-1">
                <CardContent>
                    <div className="flex w-full ml-5 my-10 justify-start text-center">
                        {reRenderPicker ?
                            <DateRangePicker
                                open={open}
                                toggle={toggle}
                                onChange={dateRangeSelected}
                                className="daterangepicker-filter"
                                closeOnClickOutside={true}
                                maxDate={moment().toDate()}
                                initialDateRange={dateRange}
                            /> : ''
                        }
                        <div className="w-1/2 cursor-pointer" onClick={() => { setReRenderPicker(true); toggle(); }}>
                            <TextField
                                className="w-full ml-0"
                                label="Select a date range"
                                variant="outlined"
                                disabled
                                value={dateRange ? `${moment(dateRange.startDate).format('YYYY/MM/DD')} - ${moment(dateRange.endDate).format('YYYY/MM/DD')}` : ''}
                            />
                        </div>
                        <Tooltip title="Clear Filter" placement="right">
                            <IconButton
                                color="primary"
                                aria-label="Clear Filter"
                                component="label"
                                onClick={clearFilter}
                            >
                                <ClearAllIcon />
                            </IconButton>
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
                </CardContent>
            </Card>
        </div>
    )

}
export default DashboardContent;