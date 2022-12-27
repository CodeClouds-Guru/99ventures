import * as React from 'react';
import { Box, Typography, List, ListItem, ListItemText} from '@mui/material';
import Helper from 'src/app/helper';


const SurveyDetails = (props) => {
    const surveyData = props.surveyData;

    return (
        <Box
            className="text-left p-5 w-full h-full">
            <Typography variant="body1" className="font-bold mb-5">Previous 5 Completions</Typography>
            {
                surveyData.length ? (
                    <List sx={{ height: 270, p:0 }} className="overflow-auto">
                        {
                            surveyData.map((item, indx) => {
                                return (
                                    <ListItem key={ indx } className="bg-gray-300 p-10 rounded mb-7" disablePadding>
                                        <ListItemText primary={
                                            <>
                                                <div className='flex justify-between mb-2'>
                                                    <Typography variant="caption" className="text-xs italic font-bold">{ item.name }</Typography>
                                                    <Typography variant="caption" className="text-xs italic">{Helper.parseTimeStamp(item.completed_at)}</Typography>
                                                </div>
                                                <Typography variant="body2" className="text-xs">${ item.amount }</Typography>
                                            </>
                                        } />
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                ) : (
                    <Typography variant="body1" className="italic text-grey-500">No records found!</Typography>
                )
            }
        </Box>
    )
}

export default React.memo(SurveyDetails);