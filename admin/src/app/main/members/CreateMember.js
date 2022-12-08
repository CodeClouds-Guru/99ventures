import { useState, useEffect } from 'react';
import { FormControl, TextField, Paper, FormHelperText, Switch, InputLabel, Button, Tooltip, IconButton, Avatar, Box } from '@mui/material';
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
    const [alertFor, setAlertFor] = useState('');
    const [allData, setAllData] = useState({
        avatar: '',
        first_name: '',
        Last_name: '',
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
        referer: '',
        referral_code: '',
    });

    const dynamicErrorMsg = (field, value) => {
        if (value) {
            delete errors[field];
            setErrors(errors);
        } else {
            setErrors(errors => ({
                ...errors, [field]: `Please insert ${field}`
            }))
        }
    }

    const onFirstNameChange = (event) => {
        setAllData(allData => ({
            ...allData, first_name: event.target.value
        }));
        dynamicErrorMsg('first_name', event.target.value.trim());
    }

    const openFileSelectDialog = () => {
        document.getElementById('contained-button-file').click();
    }
    const selectedFile = (event) => {
        event.target.files.length > 0 ? setAllData(allData => ({ ...allData, avatar: event.target.files[0] })) : setAllData(allData => ({ ...allData, avatar: '' }))
    }
    const makeAvatarBlank = () => {
        setAvatar('');
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
                        <IconButton aria-label="upload" color="success" onClick={(e) => { e.preventDefault(); uploadAvatar(); }}>
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
                        <div className="flex justify-center items-center mt-4">
                            {uploadIcon()}
                            {removeAvatar()}
                        </div>
                    </label>
                </div>
            </Root>
            {/* <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-1 max-w-full"> */}
            <Paper className="h-full sm:h-auto md:flex md:items-center md:justify-center w-full md:h-full md:w-full py-8 px-16 sm:p-28 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none ltr:border-r-1 rtl:border-l-1">
                <div className="w-full mx-auto sm:mx-0 scripts-configuration">
                    <div className='flex justify-between'>
                        <FormControl className="w-1/2 mb-24">
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
                    </div>
                </div>
            </Paper>
            {/* </div> */}
        </>
    )
}

export default CreateMember;