import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function LoginPerDay(props) {
    const [state, setState] = useState({
        options: {
            stroke: {
                curve: 'smooth'
            },
            markers: {
                size: 5
            },
            xaxis: {
                categories: [],
            }
        },
        series: [
            {
                data: [],
            }
        ],
    });
    useEffect(() => {
        setState({
            options: {
                stroke: {
                    curve: 'smooth'
                },
                markers: {
                    size: 3,
                },
                xaxis: {
                    categories: (props.loginPerDay).hasOwnProperty('names') ? props.loginPerDay.names : [],
                }
            },
            series: [
                {
                    data: (props.loginPerDay).hasOwnProperty('values') ? props.loginPerDay.values : [],
                }
            ],
        });
    }, [props.loginPerDay.names, props.loginPerDay.values]);

    return (
        <div className="w-1/2 lg:w-1/3 p-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Login Analytics</Typography>
                    <div className="line">
                        <Chart options={state.options} series={state.series} type="line" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPerDay;