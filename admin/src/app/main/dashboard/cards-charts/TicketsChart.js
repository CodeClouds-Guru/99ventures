import Chart from 'react-apexcharts';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const TicketsChart = (props) => {
    const [state, setState] = useState({
        options: {
            chart: {
                id: 'apexchart-example',
            },
            xaxis: {
                categories: []
            }
        },
        series: [],
    })
    useEffect(() => {
        setState({
            options: {
                chart: {
                    id: 'apexchart-example',
                },
                xaxis: {
                    categories: (props.ticketsChart).hasOwnProperty('names') ? props.ticketsChart.names : [],
                }
            },
            series: (props.ticketsChart).hasOwnProperty('values') ? (props.ticketsChart.values).map((row) => { return row }) : [],

        });
    }, [props.ticketsChart.names, props.ticketsChart.values]);

    return (
        <div className="xl:w-1/3 lg:w-1/3 md:w-1/2 sm:w-1/2 p-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Ticket's Chart</Typography>
                    <div className=" area">
                        <Chart options={state.options} series={state.series} type="area" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default TicketsChart;