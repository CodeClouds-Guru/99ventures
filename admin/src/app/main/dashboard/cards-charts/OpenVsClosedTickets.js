import Chart from 'react-apexcharts';
import { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const OpenVsClosedTickets = (props) => {
    const [state, setState] = useState({
        options: {
            chart: {
                id: 'apexchart-example',
            },
            xaxis: {
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }
        },
        series: [
            {
                name: 'Open',
                data: [30, 40, 25, 50, 49, 21, 70, 51]
            }, {
                name: 'Closed',
                data: [23, 12, 54, 61, 32, 56, 81, 19]
            }
        ],
    })

    return (
        <div className="w-1/2 m-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Open vs Closed Tickets</Typography>
                    <div className=" area">
                        <Chart options={state.options} series={state.series} type="area" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default OpenVsClosedTickets;