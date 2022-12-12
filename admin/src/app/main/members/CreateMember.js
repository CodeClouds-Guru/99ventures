import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Select, InputLabel, Button, Tooltip, IconButton, Avatar, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import AlertDialog from 'app/shared-components/AlertDialog';
import Helper from 'src/app/helper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getComponentData, setRevisionData } from 'app/store/components'
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
    zip_code: yup.string().required('Please enter Zipcode'),
    country_id: yup.string().required('Please enter Country'),
    // dob: yup.string().required('Please enter DOB'),
});

const defaultValues = {
    // company_id: '',
    // company_portal_id: '',
    // avatar: '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    status: '',
    address_1: '',
    address_2: '',
    address_3: '',
    zip_code: '',
    phone_no: '',
    country_id: '',
    // dob: '',
};

const CreateMember = () => {
    const module = 'members';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [companyPortalId, setCompanyPortalId] = useState('');
    const [avatar, setAvatar] = useState('');
    const [countryOptions, setCountryOptions] = useState([]);
    const [dob, setDob] = useState(moment().format('YYYY/MM/DD'));
    const { control, formState, handleSubmit, setError, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const { isValid, dirtyFields, errors } = formState;

    useEffect(() => {
        setValue('company_id', '', { shouldDirty: true, shouldValidate: false });
        setValue('company_portal_id', '', { shouldDirty: true, shouldValidate: false });
        // setValue('avatar', '', { shouldDirty: true, shouldValidate: false });
        setValue('first_name', '', { shouldDirty: true, shouldValidate: false });
        setValue('last_name', '', { shouldDirty: true, shouldValidate: false });
        setValue('email', '', { shouldDirty: true, shouldValidate: false });
        setValue('username', '', { shouldDirty: true, shouldValidate: false });
        setValue('status', '', { shouldDirty: true, shouldValidate: false });
        setValue('address_1', '', { shouldDirty: true, shouldValidate: false });
        setValue('address_2', '', { shouldDirty: true, shouldValidate: false });
        setValue('address_3', '', { shouldDirty: true, shouldValidate: false });
        setValue('zip_code', '', { shouldDirty: true, shouldValidate: false });
        setValue('phone_no', '', { shouldDirty: true, shouldValidate: false });
        setValue('country_id', '', { shouldDirty: true, shouldValidate: false });
        // setValue('dob', '', { shouldDirty: true, shouldValidate: false });

    }, [setValue]);

    useEffect(() => {
        getAddFields();
    }, []);

    const openFileSelectDialog = () => {
        document.getElementById('contained-button-file').click();
    }
    const selectedFile = (event) => {
        event.target.files.length > 0 ? setAvatar(event.target.files[0]) : setAvatar('')
    }
    const makeAvatarBlank = () => {
        setAvatar('');
        document.getElementById('contained-button-file').value = '';
    }
    const removeAvatar = () => {
        if (avatar) {
            return (
                <span className="pl-10">
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
                <span className="pr-10">
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
    const onSubmit = ({ first_name, last_name, email, username, status, address_1, address_2, address_3, zip_code, phone_no, country_id }) => {
        // console.log(first_name, last_name, email, username, status, address_1, address_2, address_3, zip_code, phone_no, country_id);
        let form_data = new FormData();
        form_data.append('company_id', companyId);
        form_data.append('company_portal_id', companyPortalId);
        form_data.append('avatar', avatar);
        form_data.append('first_name', first_name);
        form_data.append('last_name', last_name);
        form_data.append('email', email);
        form_data.append('username', username);
        form_data.append('status', status);
        form_data.append('address_1', address_1);
        form_data.append('address_2', address_2);
        form_data.append('address_3', address_3);
        form_data.append('zip_code', zip_code);
        form_data.append('phone_no', phone_no);
        form_data.append('country_id', country_id);
        const country_code = countryOptions.find(cnt => cnt.id === country_id);
        form_data.append('country_code', country_code ? country_code.phonecode : '+1');
        form_data.append('dob', moment(dob).format('YYYY/MM/DD'));

        setLoading(true);
        axios.post(jwtServiceConfig.membersSave, form_data)
            .then((response) => {
                console.log(response.data);
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
            <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full">
                <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                    <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                        <div className='flex w-full justify-between'>
                            <form
                                name="loginForm"
                                noValidate
                                className="flex flex-col justify-center w-full mt-32"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <Root className="user relative flex flex-col items-center justify-center p-16 pb-14 shadow-0">
                                    <div className="flex items-center justify-center mb-24">
                                        <input
                                            accept="image/*"
                                            className="hidden"
                                            id="contained-button-file"
                                            type="file"
                                            onChange={(e) => selectedFile(e)}
                                        />
                                        <label htmlFor="contained-button-file" onMouseEnter={addOverlay} onMouseLeave={removeOverlay}>
                                            <div className="flex justify-end items-center mt-0">
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
                                        className="w-1/2 mb-10 p-5"
                                        name="company_id"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl>
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
                                        className="w-1/2 mb-10 p-5"
                                        name="company_portal_id"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl>
                                                <InputLabel id="demo-select-small">Portal*</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="demo-select-small"
                                                    id="demo-select-small"
                                                    label="Portal"
                                                    value={companyPortalId}
                                                    onChange={(event) => { setCompanyPortalId(event.target.value) }}
                                                >
                                                    {companies[0].CompanyPortals.map((val) => {
                                                        return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                                    })
                                                    }
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                }
                                <Controller
                                    name="first_name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
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
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
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
                                    name="username"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
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
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl>
                                            <InputLabel id="demo-select-small">Status*</InputLabel>
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
                                <Controller
                                    name="address_1"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
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
                                    name="address_3"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Address 3"
                                            type="text"
                                            error={!!errors.address_3}
                                            helperText={errors?.address_3?.message}
                                            variant="outlined"
                                        />
                                    )}
                                />
                                <Controller
                                    name="country_id"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl>
                                            <InputLabel id="demo-select-small">Country*</InputLabel>
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
                                <Controller
                                    name="phone_no"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Phone"
                                            type="text"
                                            error={!!errors.phone_no}
                                            helperText={errors?.phone_no?.message}
                                            variant="outlined"
                                        />
                                    )}
                                />
                                <Controller
                                    name="dob"
                                    control={control}
                                    render={({ field }) => (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                {...field}
                                                label="DOB"
                                                value={dob}
                                                onChange={(event) => setDob(moment(event).format('YYYY/MM/DD'))}
                                                renderInput={(params) => <TextField {...params} />}
                                            />
                                        </LocalizationProvider>
                                    )}
                                />
                                <LoadingButton
                                    variant="contained"
                                    color="secondary"
                                    className=" w-full mt-16"
                                    aria-label="Sign in"
                                    disabled={_.isEmpty(dirtyFields) || !isValid}
                                    type="submit"
                                    size="large"
                                >
                                    Save
                                </LoadingButton>
                            </form>
                        </div>
                    </div>
                </Paper>
            </div>
        </>
    )
}

export default CreateMember;