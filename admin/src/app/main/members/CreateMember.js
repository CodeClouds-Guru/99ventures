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

const CreateMember = () => {
    const module = 'members';
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const [companies, setCompanies] = useState([]);
    const [companyPortals, setCompanyPortals] = useState([]);

    const [countryOptions, setCountryOptions] = useState([]);
    const [allData, setAllData] = useState({
        company_id: '',
        company_portal_id: '',
        avatar: '',
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
        country_code: '',
        dob: '',
    });

    const dynamicErrorMsg = (field, value, label) => {
        if (value) {
            delete errors[field];
            setErrors(errors);
        } else {
            setErrors(errors => ({
                ...errors, [field]: `Please insert ${label}`
            }))
        }
    }

    useEffect(() => {
        getAddFields();
    }, []);

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
    const handleCompanyId = (event) => {
        setAllData(allData => ({
            ...allData, company_id: event.target.value
        }));
        dynamicErrorMsg('company_id', event.target.value, 'Company');
    }
    const handleCompanyPortalId = (event) => {
        setAllData(allData => ({
            ...allData, company_portal_id: event.target.value
        }));
        dynamicErrorMsg('company_portal_id', event.target.value, 'Portal');
    }
    const onFirstNameChange = (event) => {
        setAllData(allData => ({
            ...allData, first_name: event.target.value
        }));
        dynamicErrorMsg('first_name', event.target.value.trim(), 'First Name');
    }
    const onLastNameChange = (event) => {
        setAllData(allData => ({
            ...allData, last_name: event.target.value
        }));
        dynamicErrorMsg('last_name', event.target.value.trim(), 'Last Name');
    }
    const onEmailChange = (event) => {
        setAllData(allData => ({
            ...allData, email: event.target.value
        }));
        // Helper.validateEmail(event.target.value) ? '' : setErrors(errors => ({ ...errors, email: 'Please insert valid email' }));
        dynamicErrorMsg('email', event.target.value.trim(), 'Email');
    }
    const onUsernameChange = (event) => {
        setAllData(allData => ({
            ...allData, username: event.target.value
        }))
        // Helper.validateUsername(event.target.value) ? setAllData(allData => ({
        //     ...allData, username: event.target.value
        // })) : setErrors(errors => ({ ...errors, username: 'Please insert valid username' }));
        dynamicErrorMsg('username', event.target.value.trim(), 'Username');
    }
    const handleMemberStatus = (event) => {
        setAllData(allData => ({
            ...allData, status: event.target.value
        }))
        dynamicErrorMsg('status', event.target.value, 'Status');
    };
    const handleAddress1 = (event) => {
        setAllData(allData => ({
            ...allData, address_1: event.target.value
        }));
        dynamicErrorMsg('address_1', event.target.value.trim(), 'Address 1');
    }
    const handleAddress2 = (event) => {
        setAllData(allData => ({
            ...allData, address_2: event.target.value
        }));
    }
    const handleAddress3 = (event) => {
        setAllData(allData => ({
            ...allData, address_3: event.target.value
        }));
    }
    const handlePhone = (event) => {
        setAllData(allData => ({
            ...allData, phone_no: event.target.value
        }));
    }
    const handleDob = (event) => {
        setAllData(allData => ({
            ...allData, dob: event
        }));
        dynamicErrorMsg('dob', event, 'DOB');
    }
    const handleCountryId = (event) => {
        setAllData(allData => ({
            ...allData, country_id: event.target.value, country_code: event.target.value
        }))
        dynamicErrorMsg('country_id', event.target.value, 'Country');
    };
    const handleZip = (event) => {
        setAllData(allData => ({
            ...allData, zip_code: event.target.value
        }));
        dynamicErrorMsg('zip_code', event.target.value.trim(), 'Zip');
    }
    const openFileSelectDialog = () => {
        document.getElementById('contained-button-file').click();
    }
    const selectedFile = (event) => {
        event.target.files.length > 0 ? setAllData(allData => ({ ...allData, avatar: event.target.files[0] })) : setAllData(allData => ({ ...allData, avatar: '' }))
    }
    const makeAvatarBlank = () => {
        setAllData(allData => ({ ...allData, avatar: '' }))
        document.getElementById('contained-button-file').value = '';
    }
    const removeAvatar = () => {
        if (allData.avatar) {
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
        if (allData.avatar) {
            return (
                <span className="pr-10">
                    <Tooltip title="Upload selected avatar" placement="left">
                        <IconButton aria-label="upload" color="success" onClick={(e) => { e.preventDefault(); }}>
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
    const onSubmit = () => {
        if (!Object.keys(errors).length) {
            let form_data = new FormData();
            form_data.append('company_id', allData.company_id);
            form_data.append('company_portal_id', allData.company_portal_id);
            form_data.append('avatar', allData.avatar);
            form_data.append('first_name', allData.first_name);
            form_data.append('last_name', allData.last_name);
            form_data.append('email', allData.email);
            form_data.append('username', allData.username);
            form_data.append('status', allData.status);
            form_data.append('address_1', allData.address_1);
            form_data.append('address_2', allData.address_2);
            form_data.append('address_3', allData.address_3);
            form_data.append('zip_code', allData.zip_code);
            form_data.append('phone_no', allData.phone_no);
            form_data.append('country_id', allData.country_id);
            form_data.append('country_code', allData.country_code);
            form_data.append('dob', moment(allData.dob).format('YYYY/MM/DD'));

            setLoading(true);
            axios.post(jwtServiceConfig.membersSave, form_data)
                .then((response) => {
                    setLoading(false);
                    if (response.data.results.status) {

                        dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                        // navigate(`/app/${module}`);
                    } else {
                        dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
                })
        }
    }
    return (
        <>
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
                                src={!allData.avatar ? '' : URL.createObjectURL(allData.avatar)}
                                alt="Avatar"
                            >
                            </Avatar>
                        </IconButton>
                    </label>
                </div>
            </Root>
            {/* <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full"> */}
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-10 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                    <div className='flex w-full justify-between'>
                        {companies.length === 0 ? '' :
                            <FormControl className="w-1/2 mb-10 p-5">
                                <InputLabel id="demo-select-small" className="pt-5 pl-5">Company</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={allData.company_id}
                                    label="Company"
                                    onChange={handleCompanyId}
                                >
                                    {companies.map((val) => {
                                        return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                    })
                                    }
                                </Select>
                                <FormHelperText error variant="standard">{errors.company_id}</FormHelperText>
                            </FormControl>
                        }
                        {!allData.company_id ? '' :
                            <FormControl className="w-1/2 mb-10 p-5">
                                <InputLabel id="demo-select-small" className="pt-5 pl-5">Portal</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={allData.company_portal_id}
                                    label="Portal"
                                    onChange={handleCompanyPortalId}
                                >
                                    {companies[0].CompanyPortals.map((val) => {
                                        return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                                    })
                                    }
                                </Select>
                                <FormHelperText error variant="standard">{errors.company_portal_id}</FormHelperText>
                            </FormControl>
                        }
                    </div>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="First Name"
                            type="text"
                            error={!!errors.first_name}
                            helperText={errors?.first_name?.message}
                            variant="outlined"
                            required
                            value={allData.first_name}
                            onChange={onFirstNameChange}
                        />
                        <FormHelperText error variant="standard">{errors.first_name}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Last Name"
                            type="text"
                            error={!!errors.last_name}
                            helperText={errors?.last_name?.message}
                            variant="outlined"
                            required
                            value={allData.last_name}
                            onChange={onLastNameChange}
                        />
                        <FormHelperText error variant="standard">{errors.last_name}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Email"
                            type="text"
                            error={!!errors.email}
                            helperText={errors?.email?.message}
                            variant="outlined"
                            required
                            value={allData.email}
                            onChange={onEmailChange}
                        />
                        <FormHelperText error variant="standard">{errors.email}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Username"
                            type="text"
                            error={!!errors.username}
                            helperText={errors?.username?.message}
                            variant="outlined"
                            required
                            value={allData.username}
                            onChange={onUsernameChange}
                        />
                        <FormHelperText error variant="standard">{errors.username}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <InputLabel id="demo-select-small" className="pt-5 pl-5">Status</InputLabel>
                        <Select
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={allData.status}
                            label="Status"
                            onChange={handleMemberStatus}
                        >
                            <MenuItem value="member">Member</MenuItem>
                            <MenuItem value="validating">Validating</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="deleted">Deleted</MenuItem>
                        </Select>
                        <FormHelperText error variant="standard">{errors.status}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Address 1"
                            type="text"
                            error={!!errors.address_1}
                            helperText={errors?.address_1?.message}
                            variant="outlined"
                            required
                            value={allData.address_1}
                            onChange={handleAddress1}
                        />
                        <FormHelperText error variant="standard">{errors.address_1}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Address 2"
                            type="text"
                            error={!!errors.address_2}
                            helperText={errors?.address_2?.message}
                            variant="outlined"
                            value={allData.address_2}
                            onChange={handleAddress2}
                        />
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Address 3"
                            type="text"
                            error={!!errors.address_3}
                            helperText={errors?.address_3?.message}
                            variant="outlined"
                            value={allData.address_3}
                            onChange={handleAddress3}
                        />
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <InputLabel id="demo-select-small" className="pt-5 pl-5">Country</InputLabel>
                        <Select
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={allData.country_id}
                            label="Country"
                            onChange={handleCountryId}
                        >
                            {countryOptions.map((val) => {
                                return <MenuItem key={val.id} value={val.id}>{val.name}</MenuItem>
                            })
                            }
                        </Select>
                        <FormHelperText error variant="standard">{errors.country_id}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Zip"
                            type="text"
                            error={!!errors.zip_code}
                            helperText={errors?.zip_code?.message}
                            variant="outlined"
                            required
                            value={allData.zip_code}
                            onChange={handleZip}
                        />
                        <FormHelperText error variant="standard">{errors.zip_code}</FormHelperText>
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        <TextField
                            label="Phone"
                            type="text"
                            error={!!errors.phone_no}
                            helperText={errors?.phone_no?.message}
                            variant="outlined"
                            value={allData.phone_no}
                            onChange={handlePhone}
                        />
                    </FormControl>
                    <FormControl className="w-1/2 mb-10 p-5">
                        {/* <InputLabel id="demo-select-small" className="pt-5 pl-5">DOB</InputLabel> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="DOB"
                                value={allData.dob}
                                onChange={handleDob}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </FormControl>
                    <motion.div
                        className="flex"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                    >
                        <LoadingButton
                            variant="contained"
                            color="secondary"
                            aria-label="Add"
                            type="submit"
                            loading={loading}
                            onClick={onSubmit}
                            disabled={Object.values(errors).length > 0}
                        >
                            Save
                        </LoadingButton>
                    </motion.div>
                </div>
            </Paper>
            {/* </div> */}
        </>
    )
}

export default CreateMember;