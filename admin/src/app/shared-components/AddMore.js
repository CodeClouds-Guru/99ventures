import { useState,useEffect } from 'react';
import {Chip, Stack, TextField} from '@mui/material';
import InputMask from 'react-input-mask';

export default function AddMore(props) {
    let [dataset, setDataset] = useState(props.data);
    let [textval, setTextVal] = useState('');

    useEffect(() => {
        if (props.data) {
            setDataset(props.data);
        }
      }, [props.data])

    const handleDelete = (index) => {
        dataset.splice(index, 1)
        setDataset([...dataset])
        props.onChange(dataset);
    };

    const getText = (e) => {
        if(e.key === 'Enter') {
            const item = e.target.value;
            if(!dataset.includes(item)) {
                dataset.push(item);
                setDataset([...dataset])
                props.onChange(dataset);
                e.target.value = '';
            }    
        }
    }

    const getTextField =
         props.mask ? <InputMask {...props} mask="999.999.999.999" maskChar="_" onKeyDown={getText}/> : 
         <TextField
                className="mb-24"
                label={props.placeholder}
                type="text"
                variant="outlined"
                fullWidth
                onKeyDown={getText}
            />;
    
     

    return (
        <div>
            {getTextField}
            <Stack direction="row" spacing={1}>
                {dataset.map((item, index) => <Chip label={item} variant="outlined" onDelete={() => {handleDelete(index)}}/>)}
            </Stack>
        </div>
    )
}
