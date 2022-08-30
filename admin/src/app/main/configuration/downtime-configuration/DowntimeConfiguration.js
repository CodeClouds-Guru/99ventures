import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import * as yup from 'yup';
import _ from '@lodash';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';

const defaultValues = {
    allowedIPs: '',
    message: '',
};


const schema = yup.object().shape({
    allowedIPs: yup
        .string()
        .required('Please enter valid IP(s)'),
    message: yup
        .string()
        .required('Please enter message'),
});

function DowntimeConfiguration() {
    const dispatch = useDispatch();
    // const [allowedIPs, setAllowedIPs] = useState([])

    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });
    const { isValid, dirtyFields, errors } = formState;

    const onSubmit = () => { }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <form
                        name="downtimeConfigurationForm"
                        noValidate
                        className="flex flex-col justify-center w-full"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Controller
                            name="allowedIPs"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Allowed IPs"
                                    type="text"
                                    error={!!errors.allowedIPs}
                                    helperText={errors?.allowedIPs?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            )}
                        />
                        <Controller
                            name="message"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Message"
                                    type="text"
                                    error={!!errors.message}
                                    helperText={errors?.message?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            )}
                        />

                        <span className="flex items-center justify-center">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="w-1/2 mt-24"
                                aria-label="Save"
                                disabled={_.isEmpty(dirtyFields) || !isValid}
                                type="submit"
                                size="large"
                            >
                                Save
                            </Button>
                        </span>
                    </form>
                </div>
            </Paper>
        </div>
    )
}

export default DowntimeConfiguration;