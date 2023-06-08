import { Card, CardContent, Typography, Divider } from '@mui/material';

const BestPerformers = (props) => {
    const data = props.bestPerformers;
    return (
        <div className="w-1/2 m-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Top 5 Best Performers</Typography>
                    <div className="w-full">
                        {
                            data.map((val, index) => {
                                return (
                                    <div key={index}>
                                        <Typography className="p-10" variant="h7" component="div">{val}</Typography>
                                        {index === data.length - 1 ? '' : <Divider className="my-10" />}
                                    </div>
                                )
                            })
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default BestPerformers;