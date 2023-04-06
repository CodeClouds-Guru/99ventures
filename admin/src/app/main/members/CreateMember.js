import { useState, useEffect } from 'react';
import { Typography, FormControl, TextField, Paper, Select, InputLabel, Tooltip, IconButton, Avatar, MenuItem, Divider } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { Link, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ClearIcon from '@mui/icons-material/Clear';
import UploadIcon from '@mui/icons-material/Upload';
import { styled } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
    '& .username, & .email': {
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
        }),
    },

    '& .avatar': {
        background: theme.palette.background.default,
        transition: theme.transitions.create('all', {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
        }),
        bottom: 0,
        '& > img': {
            borderRadius: '50%',
        },
    },
    '& .custom-overlay': {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 99,
        borderRadius: '50%',
        textAlign: 'center',
        margin: 'auto',
    },
    '& .image-edit': {
        background: 'rgba(255,255,255,0.5)',
        padding: '6px',
        borderRadius: '50%',
    }
}));

const schema = yup.object().shape({
    first_name: yup.string().required('Please enter First Name'),
    last_name: yup.string().required('Please enter Last Name'),
    email: yup.string().email('You must enter a valid email').required('You must enter a email'),
    username: yup.string().required('Please enter Username'),
    status: yup.string().required('Please enter Status'),
    address_1: yup.string().required('Please enter Address 1'),
    city: yup.string().required('Please enter City'),
    phone_no: yup.number().required('Please enter Phone').typeError('Please insert only number'),
    zip_code: yup.string().required('Please enter ZIP Code'),
    country_id: yup.string().required('Please enter Country'),
    // dob: yup.string().required('Please enter DOB'),
    gender: yup.string().required('Please enter Gender'),
});

const defaultValues = {
    // company_id: '',
    // company_portal_id: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    status: '',
    address_1: '',
    address_2: '',
    city: '',
    zip_code: '',
    phone_no: '',
    country_id: '',
    // dob: '',
    gender: '',
};

const acceptAvatarMimeTypes = ["image/jpeg", "image/png", "image/bmp", "image/svg+xml"];

const CreateMember = () => {
    const module = 'members';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [companyPortalId, setCompanyPortalId] = useState('');
    const [avatar, setAvatar] = useState('');
    const [countryOptions, setCountryOptions] = useState([]);
    const [dob, setDob] = useState(moment().subtract(18, 'years'));
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });
    const { isValid, dirtyFields, errors } = formState;

    useEffect(() => {
        setValue('company_id', '', { shouldDirty: true, shouldValidate: false });
        setValue('company_portal_id', '', { shouldDirty: true, shouldValidate: false });
        setValue('first_name', '', { shouldDirty: true, shouldValidate: false });
        setValue('last_name', '', { shouldDirty: true, shouldValidate: false });
        setValue('email', '', { shouldDirty: true, shouldValidate: false });
        setValue('username', '', { shouldDirty: true, shouldValidate: false });
        setValue('status', '', { shouldDirty: true, shouldValidate: false });
        setValue('address_1', '', { shouldDirty: true, shouldValidate: false });
        setValue('address_2', '', { shouldDirty: true, shouldValidate: false });
        setValue('city', '', { shouldDirty: true, shouldValidate: false });
        setValue('zip_code', '', { shouldDirty: true, shouldValidate: false });
        setValue('phone_no', '', { shouldDirty: true, shouldValidate: false });
        setValue('country_id', '', { shouldDirty: true, shouldValidate: false });
        setValue('gender', '', { shouldDirty: true, shouldValidate: false });
    }, [setValue]);

    useEffect(() => {
        getAddFields();
    }, []);

    const openFileSelectDialog = () => {
        document.getElementById('contained-button-file').click();
    }
    const selectedFile = (event) => {
        const file = event.target.files[0];
        const fileSizeInMB = Math.round(file.size / 1000 / 1000); //MiB
        if (fileSizeInMB > 2) {
            dispatch(showMessage({ variant: 'error', message: 'Image should be less than of 2 MB' }));
            return;
        }
        if (!acceptAvatarMimeTypes.includes(file.type)) {
            dispatch(showMessage({ variant: 'error', message: 'Invalid image type!' }));
            return;
        }
        event.target.files.length > 0 ? setAvatar(event.target.files[0]) : setAvatar('')
    }
    const makeAvatarBlank = () => {
        setAvatar('');
        document.getElementById('contained-button-file').value = '';
    }
    const removeAvatar = () => {
        if (avatar) {
            return (
                <span className="pl-10 ml-112" style={{ position: 'absolute' }}>
                    <Tooltip title="Remove selected avatar" placement="right">
                        <IconButton aria-label="clear" color="error" onClick={(e) => { e.preventDefault(); makeAvatarBlank(); }}>
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                </span>
            )
        }
    }
    const uploadIcon = () => {
        if (avatar) {
            return (
                <span className="pr-10 mt-2" style={{ position: 'absolute' }}>
                    <Tooltip title="Upload selected avatar" placement="left">
                        <IconButton aria-label="upload" color="success" onClick={(e) => {
                            e.preventDefault();
                            // uploadAvatar(); 
                        }}>
                            <UploadIcon />
                        </IconButton>
                    </Tooltip>
                </span>
            )
        }
    }
    const addOverlay = () => {
        let element = document.getElementById('avatar-div');
        element.classList.add('flex');
        element.classList.add('custom-overlay');
        element.classList.remove('hidden');
    }
    const removeOverlay = () => {
        let element = document.getElementById('avatar-div');
        element.classList.remove('custom-overlay');
        element.classList.remove('flex');
        element.classList.add('hidden');
    }

    const getAddFields = () => {
        axios.get(`${jwtServiceConfig.membersFieldsAdd}`)
            .then(response => {
                if (response.data.results.status) {
                    response.data.results.companies.length > 0 ? setCompanies(response.data.results.companies) : setCompanies([]);
                    setCountryOptions(response.data.results.country_list);
                }
            }).catch(err => {
                console.error(err)
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }));
            })
    }
    const onSubmit = ({ first_name, last_name, email, username, status, address_1, address_2, city, zip_code, phone_no, country_id, gender }) => {
        let form_data = new FormData();
        form_data.append('company_id', companyId);
        form_data.append('company_portal_id', companyPortalId);
        form_data.append('avatar', avatar);
        form_data.append('first_name', first_name);
        form_data.append('last_name', last_name);
        form_data.append('email', email);
        form_data.append('username', username);
        form_data.append('gender', gender);
        form_data.append('status', status);
        form_data.append('address_1', address_1);
        form_data.append('address_2', address_2);
        form_data.append('city', city);
        form_data.append('zip_code', zip_code);
        form_data.append('phone_no', phone_no);
        form_data.append('country_id', country_id);
        const country_code = countryOptions.find(cnt => cnt.id === country_id);
        form_data.append('country_code', country_code ? country_code.phonecode : '+1');
        form_data.append('dob', moment(dob).format('YYYY/MM/DD'));

        setLoading(true);
        axios.post(jwtServiceConfig.membersSave, form_data)
            .then((response) => {
                if (response.status === 200) {
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                    navigate(`/app/members/${response.data.results.result.id}`);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            }).finally(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div className="mt-10 ml-10">
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
                >
                    <Typography
                        className="flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to={`/app/${module}`}
                        color="inherit"
                    >
                        <FuseSvgIcon size={20}>
                            {theme.direction === 'ltr'
                                ? 'heroicons-outline:arrow-sm-left'
                                : 'heroicons-outline:arrow-sm-right'}
                        </FuseSvgIcon>
                        <span className="flex mx-4 font-medium capitalize">Members</span>
                    </Typography>
                </motion.div>
                <motion.div
                    className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.3 } }}
                >
                    <Typography className="text-16 sm:text-20 truncate font-semibold">
                        Add New
                    </Typography>
                </motion.div>
            </div>
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <form
                    name="loginForm"
                    noValidate
                    className="flex flex-col justify-center w-full mt-10"
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                        <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                            <div className="flex w-full">
                                <div className="w-1/3 justify-between pr-10 border-r-2">
                                    <Root className="user relative flex flex-col items-center justify-center p-0 mt-0 pb-14 shadow-0">
                                        <div className="flex items-center justify-center mb-24">
                                            <input
                                                accept="image/*"
                                                className="hidden"
                                                id="contained-button-file"
                                                type="file"
                                                onChange={(e) => selectedFile(e)}
                                            />
                                            <label htmlFor="contained-button-file" onMouseEnter={addOverlay} onMouseLeave={removeOverlay}>
                                                <div className="flex justify-between items-center mt-0">
                                                    {/* {uploadIcon()} */}
                                                    {removeAvatar()}
                                                </div>
                                                <IconButton onClick={openFileSelectDialog}>
                                                    <div id="avatar-div" className="items-center justify-center hidden">
                                                        <span className="image-edit">
                                                            <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="action">
                                                                feather:camera
                                                            </FuseSvgIcon>
                                                        </span>
                                                    </div>
                                                    <Avatar
                                                        sx={{
                                                            backgroundColor: 'background.paper',
                                                            color: 'text.secondary',
                                                            height: 150,
                                                            width: 150
                                                        }}
                                                        className="avatar text-50 font-bold edit-hover"
                                                        src={!avatar ? '' : URL.createObjectURL(avatar)}
                                                        alt="Avatar"
                                                    >
                                                    </Avatar>
                                                </IconButton>
                                            </label>
                                        </div>
                                    </Root>
                                    {companies.length === 0 ? '' :
                                        <Controller
                                            name="company_id"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full mb-10 p-5">
                                                    <InputLabel id="demo-select-small" >Company*</InputLabel>
                                                    <Select
                                                        {...field}
                                                        labelId="demo-select-small"
                                                        id="demo-select-small"
                                                        label="Company"
                                                        value={companyId}
                                                        onChange={(event) => { setCompanyId(event.target.value) }}
                                                    >
                                                        {companies.map((val) => {
                                                            return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                                        })
                                                        }
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    }
                                    {!companyId ? '' :
                                        <Controller
                                            name="company_portal_id"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full mb-10 p-5">
                                                    <InputLabel className="pt-5 pl-5" id="demo-select-small">Portal*</InputLabel>
                                                    <Select
                                                        {...field}
                                                        labelId="demo-select-small"
                                                        id="demo-select-small"
                                                        label="Portal"
                                                        value={companyPortalId}
                                                        onChange={(event) => { setCompanyPortalId(event.target.value) }}
                                                    >
                                                        {companies.find(item => item.id == companyId).CompanyPortals.map((val) => {
                                                            return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                                        })
                                                        }
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    }
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl className="w-full mb-10 p-5">
                                                <InputLabel className="pt-5 pl-5" id="demo-select-small">Status*</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    label="Status"
                                                    required
                                                >
                                                    <MenuItem value="member">Member</MenuItem>
                                                    <MenuItem value="validating">Validating</MenuItem>
                                                    <MenuItem value="suspended">Suspended</MenuItem>
                                                    <MenuItem value="deleted">Deleted</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </div>
                                <div className="w-2/3 justify-between pl-10">
                                    <Divider textAlign="left"><h3>Personal Details</h3></Divider>
                                    <Controller
                                        name="first_name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="First Name"
                                                type="text"
                                                error={!!errors.first_name}
                                                helperText={errors?.first_name?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="last_name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Last Name"
                                                type="text"
                                                error={!!errors.last_name}
                                                helperText={errors?.last_name?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="username"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Username"
                                                type="text"
                                                error={!!errors.username}
                                                helperText={errors?.username?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Email"
                                                type="email"
                                                error={!!errors.email}
                                                helperText={errors?.email?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="phone_no"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Phone"
                                                type="text"
                                                error={!!errors.phone_no}
                                                helperText={errors?.phone_no?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="dob"
                                        control={control}
                                        render={({ field }) => (
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    className="w-1/2 mb-10 p-5"
                                                    {...field}
                                                    label="DOB*"
                                                    value={dob}
                                                    onChange={(event) => setDob(moment(event).format('YYYY-MM-DD'))}
                                                    maxDate={moment().subtract(18, 'years')}
                                                    renderInput={(params) => <TextField {...params} />}
                                                />
                                            </LocalizationProvider>
                                        )}
                                    />
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl className="w-1/2 mb-10 p-5">
                                                <InputLabel className="pt-5 pl-5" id="demo-select-small">Gender*</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    label="Gender"
                                                    required
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="Other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <Divider textAlign="left"><h3>Address</h3></Divider>
                                    <Controller
                                        name="address_1"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Address 1"
                                                type="text"
                                                error={!!errors.address_1}
                                                helperText={errors?.address_1?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="address_2"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Address 2"
                                                type="text"
                                                error={!!errors.address_2}
                                                helperText={errors?.address_2?.message}
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="city"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="City"
                                                type="text"
                                                error={!!errors.city}
                                                helperText={errors?.city?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="country_id"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl className="w-1/2 mb-10 p-5">
                                                <InputLabel className="pt-5 pl-5" id="demo-select-small">Country*</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    label="Country"
                                                    required
                                                >
                                                    {countryOptions.map((val) => {
                                                        return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                                    })
                                                    }
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        name="zip_code"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                className="w-1/2 mb-10 p-5"
                                                {...field}
                                                label="Zip"
                                                type="text"
                                                error={!!errors.zip_code}
                                                helperText={errors?.zip_code?.message}
                                                variant="outlined"
                                                required
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <LoadingButton
                                    variant="contained"
                                    color="secondary"
                                    className="w-1/3 mt-16"
                                    aria-label="Save"
                                    disabled={_.isEmpty(dirtyFields) || !isValid}
                                    type="submit"
                                    size="large"
                                    loading={loading}
                                >
                                    Save
                                </LoadingButton>
                            </div>
                        </div>
                    </Paper>
                </form>
            </div>
        </>
    )
}

export default CreateMember;