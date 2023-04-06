import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Tab, Tabs, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { selectUser, setUser } from 'app/store/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';
import jwtServiceConfig from '../../auth/services/jwtService/jwtServiceConfig';
import jwtService from '../../auth/services/jwtService/jwtService';
import ClearIcon from '@mui/icons-material/Clear';
import UploadIcon from '@mui/icons-material/Upload';
import Account from './account/Account';
import Password from './password/Password';
import CustomLoader from 'app/shared-components/customLoader/Index';

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
        width: '100%',
        height: '100%',
        position: 'relative',
        '& svg': {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }
    }
}));
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            className="w-full"
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component="span">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function ProfileContent() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [tabValue, setTabValue] = useState(0);
    const [avatar, setAvatar] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };
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
                        {/* <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="error" onClick={(e) => { e.preventDefault(); makeAvatarBlank(); }}>
                            feather:x
                        </FuseSvgIcon> */}
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
                        {/* <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="success" onClick={(e) => { e.preventDefault(); uploadAvatar(); }}>
                            feather:upload
                        </FuseSvgIcon> */}
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
    const uploadAvatar = () => {
        setLoading(true);
        let form_data = new FormData();
        form_data.append('type', 'change_avatar');
        form_data.append('avatar', avatar);
        axios.post(jwtServiceConfig.updateProfile, form_data)
            .then((response) => {
                setLoading(false);
                if (response.data.status) {
                    jwtService.getProfile().then(user => dispatch(setUser(user)));
                    makeAvatarBlank();
                    dispatch(showMessage({ variant: 'success', message: response.data.message }))
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.errors }))
                }
            })
            .catch((error) => {
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
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
                                    {!loading ? <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="action">
                                        feather:camera
                                    </FuseSvgIcon> : <CustomLoader />
                                    }

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
                                src={!avatar ? user.avatar : URL.createObjectURL(avatar)}
                                alt={user.first_name + ' ' + user.last_name}
                            >
                                {user.first_name + ' ' + user.last_name}
                            </Avatar>
                        </IconButton>
                        {!loading && <div className="flex justify-center items-center mt-4">
                            {uploadIcon()}
                            {removeAvatar()}
                        </div>}
                    </label>
                </div>
                <Typography className="username text-14 whitespace-nowrap font-medium">
                    {user.first_name + ' ' + user.last_name}
                </Typography>
                <Typography className="email text-13 whitespace-nowrap font-medium" color="text.secondary">
                    {user.email}
                </Typography>
            </Root>
            <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
                className="pt-20"
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    scrollButtons={false}
                    value={tabValue}
                    onChange={handleChangeTab}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label="Account Details" {...a11yProps(0)} />
                    <Tab label="Change Password" {...a11yProps(1)} />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <Account />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Password />
                </TabPanel>
            </Box>
        </>
    )
}

export default ProfileContent;