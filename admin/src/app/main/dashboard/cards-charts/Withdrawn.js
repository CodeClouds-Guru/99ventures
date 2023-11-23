import { Card, CardContent, Typography } from '@mui/material';

const Withdrawn = (props) => {
    return (
        <div className="xl:w-1/3 lg:w-1/3 md:w-1/2 sm:w-1/2 p-5">
            <Card className="w-full" sx={{ color: '#283593' }}>
                <CardContent>
                    <Typography variant="h6" component="div">Withdrawn</Typography>
                    <div className="text-center py-24 w-full">
                        <Typography variant="h4">${props.amount}</Typography>
                    </div>
                </CardContent>
            </Card>
            
        </div>
    )
}
export default Withdrawn;