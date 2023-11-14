import axios from "axios";
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CardPanel from './cards-charts/CardPanel';
import MembersChart from './cards-charts/MembersChart';
import { DateRangePicker } from "mui-daterange-picker";
import TicketsChart from './cards-charts/TicketsChart';
import TopPerformers from './cards-charts/TopPerformers';
import { showMessage } from 'app/store/fuse/messageSlice';
import LoginAnalytics from './cards-charts/LoginAnalytics';
import CompletedSurveys from './cards-charts/CompletedSurveys';
import BestPerformingSurveys from './cards-charts/BestPerformingSurveys';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import { IconButton, Tooltip, OutlinedInput, InputAdornment, FormControl } from '@mui/material';


const DashboardContent = (props) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [daterangeLessData, setDaterangeLessData] = useState({});
    const [completedSurveys, setCompletedSurveys] = useState({});
    const [ticketsChart, setTicketsChart] = useState({});
    const [loginPerDay, setLoginPerDay] = useState({});
    const [membersChart, setMembersChart] = useState({});
    const [bestPerformingSurveys, setBestPerformingSurveys] = useState({});
    const [bestPerformers, setBestPerformers] = useState({});
    const [widgets, setWidgets] = useState([]);

    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(7, 'd').startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [param, setParam] = useState({
        from: dateRange.startDate,
        to: dateRange.endDate
    });

    useEffect(()=>{
        if(props.selected_widgets.length &&  props.all_widgets.length){
            const allWidgets = props.all_widgets.filter(r=> props.selected_widgets.includes(r.id))
            setWidgets(allWidgets);
        } else {
            setWidgets([]);
        }
    }, [props]);

    const dateRangeSelected = (val) => {
        setOpen(!open)
        updateDate(
            moment(val.startDate),
            moment(val.endDate),
        )
    }

    useEffect(() => {
        getDaterangeLessReport();
    }, [])

    useEffect(() => {
        for(let widget of widgets){
            getDashboardData({
                type: widget.slug,
                from: new Date(param.from),
                to: new Date(param.to)
            })
        }
    }, [param, widgets])

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

    const showWidgets = () => {
        var compoent = [];
        for(let widget of widgets){            
            if(widget.slug === 'login_analytics'){
                compoent.push(<LoginAnalytics key={widget.slug} loginPerDay={loginPerDay} />);
            }
            if(widget.slug === 'completed_surveys'){
                compoent.push(<CompletedSurveys key={widget.slug} completedSurveys={completedSurveys} />);
            }
            if(widget.slug ===  'top_performing_surveys'){
                compoent.push(<BestPerformingSurveys key={widget.slug} bestPerformingSurveys={bestPerformingSurveys} />);
             }
            if(widget.slug ===  'members_chart'){
                compoent.push(<MembersChart key={widget.slug} membersChart={membersChart} />);
             }
            if(widget.slug ===  'tickets_chart'){
                compoent.push(<TicketsChart key={widget.slug} ticketsChart={ticketsChart} />);
             }
            if(widget.slug ===  'top_performers'){
                compoent.push(<TopPerformers key={widget.slug} bestPerformers={bestPerformers} />);
             }
        }
        return compoent;
    }

    return (
        <>
            <CardPanel surveys={daterangeLessData.no_of_surveys} users={daterangeLessData.no_of_members} verifiedUsers={daterangeLessData.no_of_verified_members} completedSurveys={daterangeLessData.completed_surveys} withdrawn={daterangeLessData.total_withdrawn} />
            {
                (widgets.length != 0) && (
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
                )
            } 
            {
                (widgets.length != 0) && (
                    <div className="flex flex-wrap w-full justify-between">
                        <div className="flex flex-wrap w-full xlg:w-2/3 justify-start">
                            {showWidgets()}
                        </div>
                    </div>   
                )
            }                             
        </>
    )

}
export default DashboardContent;