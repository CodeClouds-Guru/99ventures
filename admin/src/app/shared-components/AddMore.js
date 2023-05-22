import { useState, useEffect } from 'react';
import { Chip, Stack, TextField, FormHelperText, Typography, Paper } from '@mui/material';
import InputMask from 'react-input-mask';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
export default function AddMore(props) {
    let [dataset, setDataset] = useState(props.data);
    let [errorMsg, setErrorMsg] = useState('');
    const dispatch = useDispatch();
    const [permisson, setPermission] = useState(false);
    const [required, setRequired] = useState(false);
    const bro_agent = props.bro_agent ?? false;

    useEffect(() => {
        setRequired(props.required || false);
        if (props.data) {
            setDataset(props.data);
        }
        setPermission(props.permission);
    }, [props])

    const handleDelete = (index) => {
        dataset.splice(index, 1)
        setDataset([...dataset])
        props.onChange(dataset);
    };

    const validateInput = (input) => {
        if (props.validationRegex) {
            let reg = null;
            try {
                reg = new RegExp(props.validationRegex);
            } catch (e) {
                reg = null;
            }
            // console.log(reg)
            return reg && reg.test(input)
        }
        return true;
    }

    const getText = (e) => {
        if (e.key === 'Enter') {
            const item = e.target.value;
            if (!dataset.includes(item)) {
                if (validateInput(item)) {
                    dataset.push(item);
                    setDataset([...dataset])
                    props.onChange(dataset);
                    e.target.value = '';
                } else {
                    dispatch(showMessage({ variant: 'warning', message: 'Please enter a valid input' }))
                }
            }
        }
    }

    const getTextField =
        props.mask && !bro_agent ? <InputMask {...props} mask={'999.999.999.999'} maskChar="_" onKeyDown={getText} /> :
            <div className="mb-24">
                <TextField
                    label={props.placeholder}
                    type="text"
                    variant="outlined"
                    fullWidth
                    onKeyDown={getText}
                    disabled={!permisson}
                    required={required}
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
            <Stack justifyContent="flex-start" alignItems="flex-start" spacing={1} direction="row" useFlexGap flexWrap="wrap" className="mt-10">
                {dataset.map((item, index) => <Chip key={item + index} label={item} variant="outlined" onDelete={() => { handleDelete(index) }} />)}
            </Stack>
        </div>
    )
}
