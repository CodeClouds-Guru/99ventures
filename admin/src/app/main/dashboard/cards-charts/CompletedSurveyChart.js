import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, Typography } from '@mui/material';

function CompletedSurveyChart(props) {
    const [state, setState] = useState({
        options: {
            labels: [],
            legend: {
                position: 'bottom'
            }
        },
        series: []
    });
    useEffect(() => {
        setState({
            options: {
                ...state.options,
                labels: (props.completedSurveys).hasOwnProperty('survey_names') ? props.completedSurveys.survey_names : [],
            },
            series: (props.completedSurveys).hasOwnProperty('survey_count') ? props.completedSurveys.survey_count : []
        })
    }, [props.completedSurveys.survey_names, props.completedSurveys.survey_count])

    return (
        <div className="xl:w-1/3 lg:w-1/3 md:w-1/2 sm:w-1/2 p-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Completed Surveys</Typography>
                    {state.options.labels.length > 0 && state.series.length > 0 ?
                        <div className="donut pt-15" style={{ minHeight: '315px' }}>
                            <Chart className="pt-10" options={state.options} series={state.series} type="donut" width="100%" height="300" />
                        </div> :
                        <div className="donut pt-15 flex items-center justify-center" style={{ minHeight: '315px' }}>
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

export default CompletedSurveyChart;