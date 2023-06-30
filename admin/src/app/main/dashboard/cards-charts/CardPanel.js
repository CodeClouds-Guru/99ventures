import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import History from 'src/@history/@history';

const CardPanel = (props) => {
    const navigate = useNavigate();

    return (
        <div className="flex w-full justify-center text-center">
            <Card className="w-1/4 m-5 flex items-center justify-center cursor-pointer" sx={{ backgroundColor: '#ffb0aa', color: '#9e322a' }} onClick={() => navigate('/app/survey-providers')}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.surveys}</Typography>
                    <Typography variant="h6" component="div">Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5 flex items-center justify-center cursor-pointer" sx={{ backgroundColor: '#E8EAF6', color: '#283593' }} onClick={() => navigate('/app/members')}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.users}</Typography>
                    <Typography variant="h6" component="div">Members</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5 flex items-center justify-center cursor-pointer" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} onClick={() => navigate('/app/members')}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.verifiedUsers}</Typography>
                    <Typography variant="h6" component="div">Verified Members</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5 flex items-center justify-center cursor-pointer" sx={{ backgroundColor: '#edb2ff', color: '#77298e' }} onClick={() => navigate('/app/survey-providers?completed-surveys=1')}>
                <CardContent>
                    <Typography variant="h3" component="div">{props.completedSurveys}</Typography>
                    <Typography variant="h6" component="div">Completed Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="w-1/4 m-5 flex items-center justify-center cursor-pointer" sx={{ backgroundColor: '#f2dfb0', color: '#6d634d' }} onClick={() => navigate('/app/withdrawal-requests')}>
                <CardContent>
                    <Typography variant="h3" component="div">${props.withdrawn}</Typography>
                    <Typography variant="h6" component="div">Withdrawn</Typography>
                </CardContent>
            </Card>
        </div>
    )
}

export default CardPanel;