import { Typography, List, ListItem, ListItemText} from '@mui/material';
import Helper from 'src/app/helper';

const AccountNotes = (props) => {
    const accountNotes = props.accountNotes;

    const notesList = () => {
        return accountNotes.map(note => {            
            return (
                <ListItem disablePadding key={note.id}>
                    <ListItemText className="bg-gray-300 p-10 rounded" primary={
                        <>
                            <div className='flex justify-between mb-2'>
                                <Typography variant="caption" className="text-xs italic font-bold">{note.User.alias_name} - More Surveys Support Team</Typography>
                                <Typography variant="caption" className="text-xs italic">{Helper.parseTimeStamp(note.created_at)}</Typography>
                            </div>
                            <Typography variant="body2">{note.note}</Typography>
                        </>
                    }/>
                </ListItem>
            )
        })
    }

    return (
        <List sx={{ height: 300 }} className="mt-5 p-0 notes-list overflow-auto">
            { notesList() }
        </List>
    )
}

export default AccountNotes;