import { Typography, List, ListItem, ListItemText} from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux'
import Helper from 'src/app/helper';
import axios from 'axios';



const MemberTxn = () => {
    const [ txns, setTxns ] = useState([]);

    useEffect(()=>{
        getTransaction();
    }, []);

    const getTransaction = () => {
        const params = {
            where: {
                member_id: 1
            },
            page: 1,
            show: 5
        }
        axios.get('/member-transactions', { params })
        .then(res => {
            if(res.data.results.result.data) {
                setTxns(res.data.results.result.data)
            }
        })
        .catch(error => {
            console.log(error)
            dispatch(showMessage({ variant: 'error', message: error.message}));
        })
    }


    return (
        <List sx={{ height: 200 }} className="overflow-auto">            
            {
                txns.map(txn => {
                    return (
                        <ListItem key={txn.id} className="bg-gray-300 p-10 rounded mb-7" disablePadding>
                            <ListItemText primary={
                                <>
                                    <div className='flex justify-between mb-2'>
                                        <Typography variant="caption" className="text-xs italic font-bold">Lorem Ipsum</Typography>
                                        <Typography variant="caption" className="text-xs italic">{Helper.parseTimeStamp(txn.completed_at)}</Typography>
                                    </div>
                                    <Typography variant="body2">{ txn.amount }</Typography>
                                </>
                            } />
                        </ListItem>
                    )
                })
            }
        </List>
    )
}

export default MemberTxn;