import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function MembersChart(props) {
    const [state, setState] = useState({
        options: {
            labels: ['Signed Up', 'Profile Completed', 'Verified', 'Suspended', 'Deleted']
        },
        series: [44, 55, 41, 17, 15]

    });
    return (
        <div className="w-1/2 m-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Member's Chart</Typography>
                    <div className="pie pt-15" style={{ minHeight: '315px' }}>
                        <Chart className="pt-10" options={state.options} series={state.series} type="pie" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default MembersChart;