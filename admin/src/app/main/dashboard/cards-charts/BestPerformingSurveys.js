import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';

const BestPerformingSurveys = (props) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        (props.bestPerformingSurveys).hasOwnProperty('names') ? setData(props.bestPerformingSurveys.names) : '';
    }, [props.bestPerformingSurveys.names])
    return (
        <div className="w-1/2 lg:w-full p-5 flex">
            <Card className="w-full flex justify-center" sx={{ color: '#283593' }}>
                <CardContent className="w-full">
                    <Typography className="w-full text-left" variant="h6" component="div">Top Performing Surveys</Typography>
                    <div className={data.length > 0 ? `w-full items-center justify-center` : `w-full items-center justify-center flex h-full`} style={{ minHeight: '315px' }}>
                        <div className="w-full">
                            {data.length > 0 ?
                                data.map((val, index) => {
                                    return (
                                        <div key={index}>
                                            <Typography className="p-10" variant="h7" component="div">{val}</Typography>
                                            {index === data.length - 1 ? '' : <Divider className="my-10" />}
                                        </div>
                                    )
                                }) :
                                <div className=" pt-15 flex items-center justify-center" >
                                    <div className="flex justify-center text-center" >
                                        <Typography variant="h7" component="div">No data available</Typography>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default BestPerformingSurveys;