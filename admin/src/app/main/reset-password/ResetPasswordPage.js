import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as yup from 'yup';
import _ from '@lodash';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import jwtService from '../../auth/services/jwtService';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useNavigate } from 'react-router-dom';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    password: yup
        .string()
        .required('Please enter your new password.')
        .min(8, 'Password is too short - should be 8 chars minimum.'),
    passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const defaultValues = {
    hash: '',
    password: '',
    passwordConfirm: '',
};

function ResetPasswordPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setValue('hash', params.get('hash'));
        setValue('password', '', { shouldDirty: true, shouldValidate: false });
        setValue('passwordConfirm', '', { shouldDirty: true, shouldValidate: false });
    }, [setValue]);

    const onSubmit = ({ hash, password, passwordConfirm }) => {
        if (hash && password && passwordConfirm) {
            jwtService
                .resetPassword({ hash, password })
                .then((response) => {
                    // No need to do anything, user data will be set at app/auth/AuthContext
                    if (response.status) {
                        dispatch(showMessage({ variant: 'success', message: response.message }));
                        navigate('/sign-in');
                    } else {
                        dispatch(showMessage({ variant: 'error', message: response.errors }));
                    }
                })
                .catch(() => { });
        } else {
            dispatch(showMessage({ variant: 'error', message: 'Please fill all fields' }));
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 min-w-0">
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-end w-full sm:w-auto md:h-full md:w-1/2 py-8 px-16 sm:p-48 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full max-w-320 sm:w-320 mx-auto sm:mx-0">
                    <img className="w-48" src="assets/images/logo/logo.png" alt="logo" />

                    <Typography className="mt-32 text-4xl font-extrabold tracking-tight leading-tight">
                        Set Password
                    </Typography>

                    <form
                        name="loginForm"
                        noValidate
                        className="flex flex-col justify-center w-full mt-32"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    className="mb-24"
                                    label="New Password"
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

                        <Button
                            variant="contained"
                            color="secondary"
                            className=" w-full mt-16"
                            aria-label="Sign in"
                            disabled={_.isEmpty(dirtyFields) || !isValid}
                            type="submit"
                            size="large"
                        >
                            Set Password
                        </Button>
                    </form>
                </div>
            </Paper>

            <Box
                className="relative hidden md:flex flex-auto items-center justify-center h-full p-64 lg:px-112 overflow-hidden"
                sx={{ backgroundColor: 'primary.main' }}
            >
                <svg
                    className="absolute inset-0 pointer-events-none"
                    viewBox="0 0 960 540"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMax slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <Box
                        component="g"
                        sx={{ color: 'primary.light' }}
                        className="opacity-20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="100"
                    >
                        <circle r="234" cx="196" cy="23" />
                        <circle r="234" cx="790" cy="491" />
                    </Box>
                </svg>
                <Box
                    component="svg"
                    className="absolute -top-64 -right-64 opacity-20"
                    sx={{ color: 'primary.light' }}
                    viewBox="0 0 220 192"
                    width="220px"
                    height="192px"
                    fill="none"
                >
                    <defs>
                        <pattern
                            id="837c3e70-6c3a-44e6-8854-cc48c737b659"
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="220" height="192" fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
                </Box>

                <div className="z-10 relative w-full max-w-2xl">
                    <div className="text-7xl font-bold leading-none text-gray-100">
                        <div>Welcome to</div>
                        <div>Scripteed</div>
                    </div>
                    <div className="mt-24 text-lg tracking-tight leading-6 text-gray-400">
                        Fuse helps developers to build organized and well coded dashboards full of beautiful and
                        rich modules. Join us and start building your application today.
                    </div>
                    <div className="flex items-center mt-32">
                        <AvatarGroup
                            sx={{
                                '& .MuiAvatar-root': {
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            <Avatar src="assets/images/avatars/female-18.jpg" />
                            <Avatar src="assets/images/avatars/female-11.jpg" />
                            <Avatar src="assets/images/avatars/male-09.jpg" />
                            <Avatar src="assets/images/avatars/male-16.jpg" />
                        </AvatarGroup>

                        <div className="ml-16 font-medium tracking-tight text-gray-400">
                            More than 17k people joined us, it's your turn
                        </div>
                    </div>
                </div>
            </Box>
        </div>
    );
}

export default ResetPasswordPage;
