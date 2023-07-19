import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import History from 'src/@history/@history';

const cardStyle = {
    margin: '5px',
    width: '19%',
    '@media screen and (max-width: 1600px)': {
        width: '30%'
    },
    '@media screen and (max-width: 1400px)': {
        width: '19%'
    },
    '@media screen and (max-width: 1300px)': {
        width: '23%'
    },
    '@media screen and (max-width: 900px)': {
        width: '30%'
    }
}

const CardPanel = (props) => {
    const navigate = useNavigate();

    return (
        <div className="flex w-full justify-center text-center flex-wrap">
            <Card className="flex items-center justify-center cursor-pointer" sx={{ ...cardStyle, backgroundColor: '#ffb0aa', color: '#9e322a' }} onClick={() => navigate('/app/survey-providers')}>
                <CardContent>
                    <Typography variant="h4" component="p">{props.surveys}</Typography>
                    <Typography variant="subtitle1" component="p">Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="flex items-center justify-center cursor-pointer" sx={{  ...cardStyle, backgroundColor: '#E8EAF6', color: '#283593' }} onClick={() => navigate('/app/members')}>
                <CardContent>
                    <Typography variant="h4" component="p">{props.users}</Typography>
                    <Typography variant="subtitle1" component="p">Members</Typography>
                </CardContent>
            </Card>
            <Card className="flex items-center justify-center cursor-pointer" sx={{  ...cardStyle, backgroundColor: '#E8F5E9', color: '#2E7D32' }} onClick={() => navigate('/app/members')}>
                <CardContent>
                    <Typography variant="h4" component="p">{props.verifiedUsers}</Typography>
                    <Typography variant="subtitle1" component="p">Verified Members</Typography>
                </CardContent>
            </Card>
            <Card className="flex items-center justify-center cursor-pointer" sx={{  ...cardStyle, backgroundColor: '#edb2ff', color: '#77298e' }} onClick={() => navigate('/app/survey-providers?completed-surveys=1')}>
                <CardContent>
                    <Typography variant="h4" component="p">{props.completedSurveys}</Typography>
                    <Typography variant="subtitle1" component="p">Completed Surveys</Typography>
                </CardContent>
            </Card>
            <Card className="flex items-center justify-center cursor-pointer" sx={{  ...cardStyle, backgroundColor: '#f2dfb0', color: '#6d634d' }} onClick={() => navigate('/app/withdrawal-requests')}>
                <CardContent>
                    <Typography variant="h4" component="p">${props.withdrawn}</Typography>
                    <Typography variant="subtitle1" component="p">Withdrawn</Typography>
                </CardContent>
            </Card>
        </div>
    )
}

export default CardPanel;