import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import * as yup from 'yup';
import _ from '@lodash';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';

/**
 * Form Validation Schema
 */

const defaultValues = {
    fromName: '',
    fromEmail: '',
    emailUsername: '',
    emailServerHost: '',
    port: '',
    password: '',
};

const schema = yup.object().shape({
    fromName: yup
        .string()
        .required('Please enter Name'),
    fromEmail: yup
        .string().email('Enter the valid email')
        .required('Please enter the valid Email'),
    emailUsername: yup
        .string()
        .required('Please enter Email Username'),
    emailServerHost: yup
        .string()
        .matches("^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$", 'Please enter valid server (host) name')
        .required('Please enter valid server (host) name'),
    port: yup
        .number()
        .test(
            "maxDigits",
            "Port must have 2 digits or more",
            (number) => String(number).length >= 2
        )
        .typeError('Please insert the port number')
        .required('Please insert the port number'),
});

function EmailConfiguration() {
    const dispatch = useDispatch();
    const [sslRequired, setSslRequired] = useState(false)
    const [siteNameVisible, setSiteNameVisible] = useState(false)

    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;
    useEffect(() => {
        setValue('fromName', '', { shouldDirty: true, shouldValidate: false });
        setValue('fromEmail', '', { shouldDirty: true, shouldValidate: false });
        setValue('emailUsername', '', { shouldDirty: true, shouldValidate: false });
        setValue('emailServerHost', '', { shouldDirty: true, shouldValidate: false });
        setValue('port', '', { shouldDirty: true, shouldValidate: false });
        getEmailConfiguration();
    }, [setValue])

    const getEmailConfiguration = () => {
        axios.get(jwtServiceConfig.getEmailConguration)
            .then((response) => {
                if (response.data.status) {
                    setValue('fromName', response.data.data.from_name, { shouldDirty: false, shouldValidate: true });
                    setValue('fromEmail', response.data.data.from_email, { shouldDirty: false, shouldValidate: true });
                    setValue('emailUsername', response.data.data.email_username, { shouldDirty: false, shouldValidate: true });
                    setValue('emailServerHost', response.data.data.email_server_host, { shouldDirty: false, shouldValidate: true });
                    setValue('port', response.data.data.email_server_port, { shouldDirty: false, shouldValidate: true });
                    setValue('password', response.data.data.password, { shouldDirty: false, shouldValidate: true });
                    setSslRequired(response.data.data.ssl_required === 1);
                    setSiteNameVisible(response.data.data.site_name_visible === 1);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    const onSubmit = ({ fromName, fromEmail, emailUsername, emailServerHost, port, sslRequired, siteNameVisible, password }) => {
        let data = {
            "from_name": fromName,
            "from_email": fromEmail,
            "email_username": emailUsername,
            "email_server_host": emailServerHost,
            "email_server_port": port,
            "ssl_required": sslRequired ? 1 : 0,
            "site_name_visible": siteNameVisible ? 1 : 0,
            "password": password,
        }

        axios.post(jwtServiceConfig.saveEmailConguration, data)
            .then((response) => {
                if (response.data.status) {
                    dispatch(showMessage({ variant: 'success', message: response.data.message }))
                    getEmailConfiguration();
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    const selectSslRequired = (event) => {
        console.log('ssl', event.target.checked)
        setSslRequired(event.target.checked)
    }
    const selectSiteNameVisible = (event) => {
        console.log('visible', event.target.checked)
        setSiteNameVisible(event.target.checked)
    }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-64 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0">
                    <form
                        name="emailConfigurationForm"
                        noValidate
                        className="flex flex-col justify-center w-full"
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
                                <FormControl className="items-center">
                                    <FormControlLabel
                                        label="Requires a secure connection (SSL)"
                                        control={
                                            <Checkbox checked={sslRequired} onChange={selectSslRequired} {...field} />
                                        }
                                    />
                                    <FormHelperText>{errors?.sslRequired?.message}</FormHelperText>

                                </FormControl>
                            )}
                        />

                        <Controller
                            name="siteNameVisible"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="items-center">
                                    <FormControlLabel
                                        label="Include site name at the begining of the subject"
                                        control={
                                            <Checkbox checked={siteNameVisible} onChange={selectSiteNameVisible} {...field} />
                                            // <input type="checkbox" checked={siteNameVisible} onChange={() => selectSiteNameVisible} {...field} />
                                        }
                                    />
                                    <FormHelperText>{errors?.siteNameVisible?.message}</FormHelperText>
                                </FormControl>
                            )}
                        />
                        <span className="flex items-center justify-center">
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
                        </span>
                    </form>
                </div>
            </Paper>
        </div>
    )
}

export default EmailConfiguration;