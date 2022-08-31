import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import * as yup from 'yup';
import _ from '@lodash';
import { useEffect, useState } from 'react';
import jwtServiceConfig from '../../../auth/services/jwtService/jwtServiceConfig';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    password: yup
        .string()
        .required('Please enter your new password')
        .min(8, 'Password is too short - should be 8 chars minimum'),
    passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const defaultValues = {
    password: '',
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
    useEffect(() => {
        setValue('password', '', { shouldDirty: true, shouldValidate: false });
        setValue('passwordConfirm', '', { shouldDirty: true, shouldValidate: false });
    }, [setValue]);
    const onSubmit = () => { }
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