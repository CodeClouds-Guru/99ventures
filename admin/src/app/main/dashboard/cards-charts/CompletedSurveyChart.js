import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function CompletedSurveyChart(props) {
    const [state, setState] = useState({
        options: {
            labels: []
        },
        series: []
    });
    useEffect(() => {
        // setState({
        //     options: {
        //         labels: props.completedSurveys.survey_names,
        //     },
        //     series: props.completedSurveys.survey_count
        // })
    }, [props.completedSurveys])

    return (
        <div className="w-1/2 m-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Completed Surveys</Typography>
                    <div className="donut pt-15" style={{ minHeight: '315px' }}>
                        <Chart className="pt-10" options={state.options} series={state.series} type="donut" width="100%" height="300" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CompletedSurveyChart;