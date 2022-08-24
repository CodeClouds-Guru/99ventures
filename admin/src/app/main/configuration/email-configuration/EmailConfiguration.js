import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import _ from '@lodash';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import jwtService from '../../../auth/services/jwtService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    fromName: yup
        .string()
        .required('Please enter From Name'),
    fromEmail: yup
        .string()
        .required('Please enter From Email'),
    emailUsername: yup
        .string()
        .required('Please enter Email Username'),
    emailServerHost: yup
        .string()
        .required('Please enter server (host)'),
    port: yup
        .number()
        .required('Please enter From-Email'),
    // password: yup
    //     .string()
    //     .nullable()
    //     .notRequired()
    //     .when('password', {
    //         is: (value) => value?.length,
    //         then: (rule) => rule.min(8),
    //     }),
});

const defaultValues = {
    fromName: '',
    fromEmail: '',
    emailUsername: '',
    emailServerHost: '',
    port: '',
    password: '',
    sslRequired: false,
    siteNameVisible: false,
};

function EmailConfiguration() {
    useEffect(() => { }, [])
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;

    const onSubmit = () => { }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full sm:w-auto md:h-full md:w-full py-8 px-16 sm:p-48 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <form
                        name="emailConfigurationForm"
                        noValidate
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Controller
                            name="fromName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="From Name"
                                    type="text"
                                    error={!!errors.fromName}
                                    helperText={errors?.fromName?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="fromEmail"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="From Email"
                                    type="text"
                                    error={!!errors.fromEmail}
                                    helperText={errors?.fromEmail?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="emailUsername"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Email Username"
                                    type="text"
                                    error={!!errors.emailUsername}
                                    helperText={errors?.emailUsername?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="emailServerHost"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Email Server(Host)"
                                    type="text"
                                    error={!!errors.emailServerHost}
                                    helperText={errors?.emailServerHost?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="port"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Port"
                                    type="text"
                                    error={!!errors.port}
                                    helperText={errors?.port?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="Password"
                                    type="password"
                                    error={!!errors.password}
                                    helperText={errors?.password?.message}
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />

                        <Controller
                            name="sslRequired"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="items-center" error={!!errors.sslRequired}>
                                    <FormControlLabel
                                        label="Requires a secure connection (SSL)"
                                        control={<Checkbox size="small" {...field} />}
                                    />
                                    <FormHelperText>{errors?.sslRequired?.message}</FormHelperText>

                                </FormControl>
                            )}
                        />

                        <Controller
                            name="siteNameVisible"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="items-center" error={!!errors.siteNameVisible}>
                                    <FormControlLabel
                                        label="Include site name at the begining of the subject"
                                        control={<Checkbox size="small" {...field} />}
                                    />
                                    <FormHelperText>{errors?.siteNameVisible?.message}</FormHelperText>
                                </FormControl>
                            )}
                        />


                        <Button
                            variant="contained"
                            color="secondary"
                            className="w-1/2 mt-24"
                            aria-label="Register"
                            disabled={_.isEmpty(dirtyFields) || !isValid}
                            type="submit"
                            size="large"
                        >
                            Save
                        </Button>
                    </form>
                </div>
            </Paper>
        </div>
    )
}

export default EmailConfiguration;