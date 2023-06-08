import { Card, CardContent, Typography, TextField, IconButton, Tooltip } from '@mui/material';
import { DateRangePicker } from "mui-daterange-picker";
import moment from 'moment';
import { useState, useEffect } from 'react';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios"
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import CardPanel from './cards-charts/CardPanel';
import OpenVsClosedTickets from './cards-charts/OpenVsClosedTickets';
import LoginPerDay from './cards-charts/LoginPerDay';
import CompletedSurveyChart from './cards-charts/CompletedSurveyChart';
import MembersChart from './cards-charts/MembersChart';
import BestPerformingSurveys from './cards-charts/BestPerformingSurveys';
import BestPerformers from './cards-charts/BestPerformers';

const DashboardContent = () => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(!open);
    const [daterangeLessData, setDaterangeLessData] = useState({});
    const [completedSurveys, setCompletedSurveys] = useState({});
    const [openVsClosedTickets, setOpenVsClosedTickets] = useState({});
    const [loginPerDay, setLoginPerDay] = useState({});
    const [membersChart, setMembersChart] = useState({});
    const [bestPerformingSurveys, setBestPerformingSurveys] = useState({});
    const [bestPerformers, setBestPerformers] = useState({});
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day'),
        endDate: moment(),
    });
    const [param, setParam] = useState({
        from: moment(dateRange.startDate).format('YYYY-MM-DD'),
        to: moment(dateRange.endDate).add(1, 'day').format('YYYY-MM-DD')
    })

    const dateRangeSelected = (val) => {
        toggle();
        setDateRange({
            startDate: moment(val.startDate),
            endDate: moment(val.endDate)
        });
    }
    const constructParam = () => {
        setParam({
            from: moment(dateRange.startDate).format('YYYY-MM-DD'),
            to: moment(dateRange.endDate).add(1, 'day').format('YYYY-MM-DD')
        })
    }
    useEffect(() => {
        getDaterangeLessReport();
    }, [])
    useEffect(() => {
        constructParam();
    }, [dateRange])
    useEffect(() => {
        getCompletedSurveys();
    }, [param])
    const clearFilter = () => {
        setDateRange({
            startDate: moment().subtract(7, 'd').startOf('day'),
            endDate: moment(),
        });
    }

    const getDaterangeLessReport = () => {
        axios.get(jwtServiceConfig.dashboardDaterangeLessReport + '?type=count_report').then((res) => {
            setDaterangeLessData(res.data.results)
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }
    const getCompletedSurveys = () => {
        axios.get(jwtServiceConfig.dashboardDaterangeLessReport + `?type=completed_surveys&from=${param.from}&to=${param.to}`).then((res) => {
            console.log(res)
        }).catch(e => {
            console.error(e)
            dispatch(showMessage({ variant: 'error', message: 'Oops! Unable to fetch' }))
        });
    }

    return (
        <div>
            <div className="flex w-full ml-5 my-10 justify-start text-center">
                <DateRangePicker
                    open={open}
                    toggle={toggle}
                    onChange={dateRangeSelected}
                    className="daterangepicker-filter"
                    closeOnClickOutside={true}
                />
                <div className="w-1/2 cursor-pointer" onClick={toggle}>
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
            <CardPanel surveys={daterangeLessData.no_of_surveys} users={daterangeLessData.no_of_members} verifiedUsers={daterangeLessData.no_of_verified_members} completedSurveys={88} />
            <div className="flex w-full justify-between">
                <LoginPerDay />
                <CompletedSurveyChart />
            </div>
            <div className="flex w-full justify-between">
                <MembersChart />
                <OpenVsClosedTickets />
            </div>
            <div className="flex w-full justify-between">
                <BestPerformingSurveys bestPerformingSurveys={['CINT', 'CINT', 'CINT', 'CINT', 'CINT']} />
                <BestPerformers bestPerformers={['Johny Bro', 'Johny Bro', 'Johny Bro', 'Johny Bro', 'Johny Bro']} />
            </div>
        </div>
    )

}
export default DashboardContent;