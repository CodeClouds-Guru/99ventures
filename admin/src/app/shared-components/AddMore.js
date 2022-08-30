import { useState, useEffect } from 'react';
import { Chip, Stack, TextField, FormHelperText, Typography } from '@mui/material';
import InputMask from 'react-input-mask';

export default function AddMore(props) {
    let [dataset, setDataset] = useState(props.data);
    let [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (props.data) {
            console.log(props, props.data)
            setDataset(props.data);
        }
        // handleData(props);
    }, [props.data])
    // const handleData = (props) => {
    //     if (props.data) {
    //         console.log(props, props.data)
    //         if (props.insertType === 'ip' && validateIP(props.data)) {
    //             return;
    //         }
    //         setDataset(props.data);
    //     }
    // }

    // const validateIP = (val) => {
    //     return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val) ? setErrorMsg('') : setErrorMsg('Please enter valid IP')
    // }
    const handleDelete = (index) => {
        dataset.splice(index, 1)
        setDataset([...dataset])
        props.onChange(dataset);
    };

    const getText = (e) => {
        if (e.key === 'Enter') {
            const item = e.target.value;
            if (!dataset.includes(item)) {
                dataset.push(item);
                setDataset([...dataset])
                props.onChange(dataset);
                e.target.value = '';
            }
        }
    }

    const getTextField =
        props.mask ? <InputMask {...props} mask="999.999.999.999" maskChar="_" onKeyDown={getText} /> :
            <div className="mb-24">
                <TextField
                    label={props.placeholder}
                    type="text"
                    variant="outlined"
                    fullWidth
                    onKeyDown={getText}
                />
                <FormHelperText>
                    Press Enter to add
                </FormHelperText>
                {/* <Typography variant="body2" color="red">{errorMsg}</Typography> */}
            </div>;



    return (
        <div>
            {getTextField}
            <span>Selected Values: </span>
            <Stack direction="row" spacing={1} className="mt-10">
                {dataset.map((item, index) => <Chip key={item + index} label={item} variant="outlined" onDelete={() => { handleDelete(index) }} />)}
            </Stack>
        </div>
    )
}
