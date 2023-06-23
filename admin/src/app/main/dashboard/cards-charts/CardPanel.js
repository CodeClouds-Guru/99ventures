import { Card, CardContent, Typography } from '@mui/material';

const CardPanel = (props) => {
    return (
        <div className="flex w-full justify-center text-center">
            <Card className="w-1/4 m-5" sx={{ backgroundColor: '#ffb0aa', color: '#9e322a' }}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.surveys}</Typography>
                    <Typography variant="h6" component="div">Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5" sx={{ backgroundColor: '#E8EAF6', color: '#283593' }}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.users}</Typography>
                    <Typography variant="h6" component="div">Members</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.verifiedUsers}</Typography>
                    <Typography variant="h6" component="div">Verified Members</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5" sx={{ backgroundColor: '#edb2ff', color: '#77298e' }}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.completedSurveys}</Typography>
                    <Typography variant="h6" component="div">Completed Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5" sx={{ backgroundColor: '#f2dfb0', color: '#6d634d' }}>
                <CardContent>
                    <Typography variant="h3" component="div">${props.withdrawn}</Typography>
                    <Typography variant="h6" component="div">Withdrawn</Typography>
                </CardContent>
            </Card>
        </div>
    )
}

export default CardPanel;