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
import Account from './account/Account';
import Password from './password/Password';

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
                <span className="flex justify-end items-end">
                    <Tooltip title="Remove selected avatar" placement="right-end">
                        <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="action" onClick={(e) => { e.preventDefault(); makeAvatarBlank(); }}>
                            feather:x
                        </FuseSvgIcon>
                    </Tooltip>
                </span>
            )
        }
    }
    const uploadIcon = () => {
        if (avatar) {
            return (
                <span className="flex justify-center items-center">
                    <Tooltip title="Upload selected avatar" placement="left">
                        <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="action" onClick={(e) => { e.preventDefault(); uploadAvatar(); }}>
                            feather:upload
                        </FuseSvgIcon>
                    </Tooltip>
                </span>
            )
        }
    }
    const uploadAvatar = () => {
        let form_data = new FormData();
        form_data.append('type', 'change_avatar');
        form_data.append('avatar', avatar);
        axios.post(jwtServiceConfig.updateProfile, form_data)
            .then((response) => {
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
                    <label htmlFor="contained-button-file">
                        {removeAvatar()}
                        <IconButton onClick={openFileSelectDialog}>
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
                        {uploadIcon()}
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