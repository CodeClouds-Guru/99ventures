import {Card, CardHeader, Divider} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const CampaignDetails = () =>{
    return (
        <Card className="xl:w-2/5 md:w-1/2 sm:w-2/3">
            <CardHeader
                sx={{ backgroundColor: 'rgb(246, 249, 251)'}}
                className="px-12 py-6"       
                title={
                    <Typography className="text-lg font-bold">Campaign Details</Typography>
                }
            />
            <Divider  />
            <CardContent className="p-12">
                <div className="flex flex-col">
                    <Typography variant="body1" className="mb-3">ID: </Typography>
                    <Typography variant="body1" className="mb-3">Campaign Name: </Typography>
                    <Typography variant="body1">Start Date</Typography>
                </div>
            </CardContent>
        </Card>
    )
}

export default CampaignDetails;