import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, FormControl, FormControlLabel, TextField, Paper, FormHelperText, TextareaAutosize, Card, CardContent, CardHeader, Typography, AvatarGroup, Avatar, Box } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import { useEffect } from 'react';
import jwtService from '../../auth/services/jwtService';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useNavigate } from 'react-router-dom';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    firstName: yup
        .string()
        .required('Please enter your first name'),
    lastName: yup
        .string()
        .required('Please enter your last name'),
    username: yup
        .string()
        .required('Please enter your username'),
    email: yup
        .string()
        .email()
        .required(''),
    phone: yup
        .number()
        .notRequired(),
    password: yup
        .string()
        .required('Please enter your new password')
        .min(8, 'Password is too short - should be 8 chars minimum'),
    passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const defaultValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
};

function ProfilePage() {
    const dispatch = useDispatch();
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;

    useEffect(() => {
        setValue('firstName', '', { shouldDirty: true, shouldValidate: false });
        setValue('lastName', '', { shouldDirty: true, shouldValidate: false });
        setValue('username', '', { shouldDirty: true, shouldValidate: false });
        setValue('email', '', { shouldDirty: true, shouldValidate: false });
        setValue('phone', '', { shouldDirty: true, shouldValidate: false });
        setValue('password', '', { shouldDirty: true, shouldValidate: false });
        setValue('passwordConfirm', '', { shouldDirty: true, shouldValidate: false });
    }, [setValue]);

    const onSubmit = ({ firstName, lastName, username, email, phone, password, passwordConfirm }) => { }

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
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="First Name"
                                    type="text"
                                    error={!!errors.firstName}
                                    helperText={errors?.firstName?.message}
                                    variant="outlined"
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </form>
                </div>
            </Paper>
        </div>
    )
}

export default ProfilePage;