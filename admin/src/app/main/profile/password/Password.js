import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import axios from 'axios';
import { useEffect } from 'react';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    oldPassword: yup
        .string()
        .required('Please enter your old password'),
    newPassword: yup
        .string()
        .required('Please enter your new password')
        .min(8, 'Password is too short - should be 8 chars minimum'),
    passwordConfirm: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

const defaultValues = {
    oldPassword: '',
    newPassword: '',
    passwordConfirm: '',
};

function Password() {
    const dispatch = useDispatch();
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });
    const { isValid, dirtyFields, errors } = formState;
    const initialFields = () => {
        setValue('oldPassword', '', { shouldDirty: true, shouldValidate: false });
        setValue('newPassword', '', { shouldDirty: true, shouldValidate: false });
        setValue('passwordConfirm', '', { shouldDirty: true, shouldValidate: false });
    }
    useEffect(() => {
        initialFields();
    }, [setValue]);
    const onSubmit = ({ oldPassword, newPassword, passwordConfirm }) => {
        axios.post(jwtServiceConfig.updateProfile, {
            type: 'change_password',
            old_password: oldPassword,
            password: newPassword
        })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data.status) {
                        initialFields();
                        dispatch(showMessage({ variant: 'success', message: response.data.message }));
                    } else {
                        dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                    }
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }
    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
            <div className="w-full mx-auto sm:mx-0">
                <form
                    name="passwordForm"
                    noValidate
                    className="flex flex-col justify-center w-full"
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Controller
                        name="oldPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="Old Password"
                                type="password"
                                error={!!errors.oldPassword}
                                helperText={errors?.oldPassword?.message}
                                variant="outlined"
                                required
                                fullWidth
                            />
                        )}
                    />
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="New Password"
                                type="password"
                                error={!!errors.newPassword}
                                helperText={errors?.newPassword?.message}
                                variant="outlined"
                                required
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="passwordConfirm"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                className="mb-24"
                                label="Confirm Password"
                                type="password"
                                error={!!errors.passwordConfirm}
                                helperText={errors?.passwordConfirm?.message}
                                variant="outlined"
                                required
                                fullWidth
                            />
                        )}
                    />

                    <span className="flex items-center justify-center">
                        <Button
                            variant="contained"
                            color="secondary"
                            className="w-1/2 mt-24"
                            aria-label="Change password"
                            disabled={_.isEmpty(dirtyFields) || !isValid}
                            type="submit"
                            size="large"
                        >
                            Save
                        </Button>
                    </span>
                </form>
            </div>
        </div>
    )
}

export default Password