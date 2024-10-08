import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function MembersChart(props) {
    const [state, setState] = useState({
        options: {
            labels: [],
            legend: {
                position: 'bottom'
            },
            plotOptions:{
                pie:{
                    donut: {
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                            },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600,
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#373d3f',
                            }
                        }
                    }
                }
            }
        },
        series: []
    });
    useEffect(() => {
        setState({
            options: {
                ...state.options,
                labels: (props.membersChart).hasOwnProperty('names') ? props.membersChart.names : []
            },
            series: (props.membersChart).hasOwnProperty('values') ? props.membersChart.values : []
        })
    }, [props.membersChart.names, props.membersChart.values])

    return (
        <div className="xl:w-1/3 lg:w-1/3 md:w-1/2 sm:w-1/2 p-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Member's Chart</Typography>
                    {state.options.labels.length > 0 && state.series.length > 0 ?
                        <div className="pie pt-15" style={{ minHeight: '315px' }}>
                            <Chart className="pt-10" options={state.options} series={state.series} type="pie" width="100%" height="300" />
                        </div> :
                        <div className="pie pt-15 flex items-center justify-center" style={{ minHeight: '315px' }}>
                            <div className="flex justify-center text-center" >
                                <Typography variant="h7" component="div">No data available</Typography>
                            </div>
                        </div>

                    }
                </CardContent>
            </Card>
        </div>
    );
}

export default MembersChart;