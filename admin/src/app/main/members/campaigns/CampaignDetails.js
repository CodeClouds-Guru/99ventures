import * as React from 'react'
import {Card, CardHeader, Divider} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Helper from 'src/app/helper';

const CampaignDetails = ({campaign}) =>{
    // console.log(campaign)
    return (
        <Card className="xl:w-4/12 md:w-1/2 sm:w-2/5">
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
                    <Typography variant="body1" className="mb-3">ID: {campaign.id}</Typography>
                    <Typography variant="body1" className="mb-3">Campaign Name: {campaign.name}</Typography>
                    <Typography variant="body1">Start Date: {Helper.parseTimeStamp(campaign.created_at)}</Typography>
                </div>
            </CardContent>
        </Card>
    )
}

export default React.memo(CampaignDetails);