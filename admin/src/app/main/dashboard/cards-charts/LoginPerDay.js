import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function LoginPerDay(props) {
    const [state, setState] = useState({
        options: {
            stroke: {
                curve: 'smooth'
            },
            markers: {
                size: 0
            },
            xaxis: {
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }
        },
        series: [
            {
                data: [30, 40, 25, 50, 49, 21, 70, 51]
            }
        ],
    });

    return (
        <div className="w-1/2 m-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Login Per day</Typography>
                    <div className="line">
                        <Chart options={state.options} series={state.series} type="line" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPerDay;