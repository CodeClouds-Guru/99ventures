import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';


const labels = {
    a: 'Condition Met (Postback Triggered)',
    b: 'Condition Met (Postback Not Triggered)',
    c: 'Condition Met (Reversed)',
    d: 'Condition Not Met'
};


const PieChart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { campaignId } = useParams();
    const [chartState, setChartState] = useState({
        series : [0, 0, 0, 0],
        options: {
            labels: Object.values(labels),
            chart: {
                width: 500,
                type: 'pie',
            },
            colors:['#2e7d32', '#ed6c02', '#1e293b', '#f44336'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        }
    });

    const seriesData = {
        a: 0,
        b: 0,
        c: 0,
        d: 0
    };

    useEffect(()=>{
        getDetails();
    }, []);

    const getDetails = () => {
        const params = {
            report: 1,
            page: 1,
            show: 9999
        };

        axios.get(jwtServiceConfig.getSingleCampaign + '/' + campaignId, { params })
        .then(res => {
            if(res.data.results.status && res.data.results.result.data.length){
                const result = res.data.results.result.data;
                result.map(data => {
                    switch(data.campaign_status){
                        case 0:
                            seriesData.a += 1;
                            break;
                        case 1: 
                            seriesData.b += 1;
                            break;
                        case 2: 
                            seriesData.c += 1;
                            break;
                        case 3: 
                            seriesData.d += 1;
                            break;
                        default:
                        
                    }
                });

                setChartState({
                    ...chartState,
                    series: Object.values(seriesData)
                });
            }
        })
        .catch(errors => {
            dispatch(showMessage({ variant: 'error', message: errors.message}));
            navigate('/app/campaigns');
        });
    }

    return (
        <div className="donut w-full flex justify-center">
            <Chart options={chartState.options} series={chartState.series} type="pie" width={600}/>
        </div>
    );
}

export default PieChart;