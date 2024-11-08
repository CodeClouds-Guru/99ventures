import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, } from 'react';
import { Box, Divider, IconButton, Typography, TextField, Autocomplete, Chip, Dialog, DialogTitle, DialogActions, DialogContent, Button, List, ListItem, ListItemText, TextareaAutosize, Tooltip, Popover, Link as AnchorLink } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import AccountNotes from './components/AccountNotes';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'
import Adjustment from './components/Adjustment';
import SurveyDetails from './components/SurveyDetails';
import Helper from 'src/app/helper';
import MemberAvatar from './components/MemberAvatar';
import StickyMessage from './components/StickyMessage';
import BackdropLoader from 'app/shared-components/BackdropLoader';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";
import { selectUser } from 'app/store/userSlice';
import PaymentMethodUpdate from './components/PaymentMethodUpdate';

const labelStyling = {
    '@media screen and (max-width: 1500px)': {
        fontSize: '1.18rem'
    },
    '@media screen and (max-width: 1400px)': {
        fontSize: '1.2rem'
    },
    '@media screen and (max-width: 1199px)': {
        fontSize: '1.6rem'
    },
    '@media screen and (max-width: 768px)': {
        fontSize: '1.4rem'
    },
    '@media screen and (max-width: 575px)': {
        fontSize: '1.2rem'
    }
}

const textFieldStyle = {
    width: '100%',
    '& .muiltr-r11gs3-MuiInputBase-root-MuiInput-root': {
        minHeight: '30px',
        '& .MuiInputBase-input': {
            ...labelStyling
        }
    }
}

const iconStyle = {
    width: '18px',
    height: '18px',
    minWidth: '18px',
    minHeight: '18px',
    fontSize: '18px',
    lineHeight: 20,
    '@media screen and (max-width: 1600px)': {
        width: '16px',
        height: '16px',
        minWidth: '16px',
        minHeight: '16px',
        fontSize: '16px',
        lineHeight: 18
    },
    '@media screen and (max-width: 1400px)': {
        width: '15px',
        height: '15px',
        minWidth: '15px',
        minHeight: '15px',
        fontSize: '15px',
        lineHeight: 15
    },
    '@media screen and (max-width: 1279px)': {
        width: '20px',
        height: '20px',
        minWidth: '20px',
        minHeight: '20px',
        fontSize: '20px',
        lineHeight: 20
    },
    '@media screen and (max-width: 575px)': {
        width: '15px',
        height: '15px',
        minWidth: '15px',
        minHeight: '15px',
        fontSize: '15px',
        lineHeight:15
    }
}

const autoCompleteStyle = {
    '& .MuiAutocomplete-inputRoot': {
        minHeight: '30px',
        '& .MuiInputBase-input': {
            ...labelStyling
        }
    },
    '& .MuiFormControl-fullWidth': {
        '@media screen and (max-width: 1400px)': {
            width: '100%'
        }
    }
}

const iconLabel = {
    '@media screen and (max-width: 1400px)': {
        padding: '3px'
    },
}

const selectStyle = {
    // minWidth: '220px',
    // '@media screen and (max-width: 1400px)': {
    //     minWidth: '100%'
    // }
}

const listItemTextStyle = {
    wordBreak: 'break-word',
    margin: '2px 0',
    '& .MuiListItemText-primary': {
        display: 'flex',
        justifyContent: 'space-between'
    },
    '@media screen and (max-width: 1400px)': {
        '& .left-textbox': {
            paddingRight: '10px'
        }
    }
}

const chipStyle = {
    '@media screen and (max-width: 1400px)': {
        fontSize: '1.1rem',
        height: '25px',
        width: 'auto'
    },
    '@media screen and (max-width: 1280px)': {
        fontSize: '1.3rem',
        height: 'auto',
    },
    '@media screen and (max-width: 575px)': {
        fontSize: '1rem'
    }
}

const MemberDetails = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const user = useSelector(selectUser);

    const [msg, setMsg] = useState('');
    const [avatar, setAvatar] = useState('');
    const [status, setStatus] = useState('');
    const [loader, setLoader] = useState(true);
    const [alertType, setAlertType] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [memberData, setMemberData] = useState({});
    const [avatarFile, setAvatarFile] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [memberinfo, setMemberinfo] = useState({});
    const [countryData, setCountryData] = useState([]);
    const [adminStatus, setAdminStatus] = useState('');
    const [btnloading, setBtnLoading] = useState(false);
    const [editStatus, setEditStatus] = useState(false);
    const [accountNotes, setAccountNotes] = useState([]);
    const [dob, setDob] = useState(moment('1990-01-01'));
    const [paymentEmail, setPaymentEmail] = useState('');
    const [reflinkMode, setReflinkMode] = useState(false);
    const [actionLoader, setActionLoader] = useState(false);
    const [surveyDetails, setSurveyDetails] = useState([]);
    const [dialogStatus, setDialogStatus] = useState(false);
    const [memberDeleted, setMemberDeleted] = useState(false);
    const [skipBtnLoading, setSkipBtnLoading] = useState(false);
    const [statuslessNote, setStatuslessNote] = useState(false);
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [editAdminStatus, setEditAdminStatus] = useState(false);
    const [editPaymentEmail, setEditPaymentEmail] = useState(false);
    
    
    const clickToCopy = (text) => {
        Helper.copyTextToClipboard(text).then(res => {
            dispatch(showMessage({ variant: 'success', message: 'Copied' }));
        }).catch((error) => {
            dispatch(showMessage({ variant: 'error', message: error }))
        })
    }

    const onOpenAlertDialogHandle = (type) => {
        var msg = '';
        if (type === 'delete')
            msg = 'Do you want to <strong>permanently</strong> delete this account?';
        else if (type === 'save_profile')
            msg = 'Do you want to save the changes?';
        else if (type === 'adjustment')
            msg = 'Do you want to adjust the amount?';
        else if (type === 'impersonate')
            msg = 'Please note that this action will cause termination to any active session on the front-end. Do you really want to proceed?';
        else if (type === 'unlink_referrer')
            msg = 'Do you want to unlink referrer?';

        setAlertType(type);
        setMsg(msg);
        setOpenAlertDialog(true);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
        setMsg('');
        setAlertType('');
    }

    const onConfirmAlertDialogHandle = () => {
        if (alertType === 'save_profile') {
            handleFormSubmit();
        } else if (alertType === 'delete') {
            deleteAccount();
        } else if (alertType === 'impersonate'){
            impersonateAccount();
        } else if (alertType === 'unlink_referrer') {
            removeReferrer();
        }
    }

    const memberNoteDeleted = () => {
        getMemberData();
    }

    /**
     * Get Member Details
     */
    const getMemberData = (updateAvatar = true) => {
        axios.get(jwtServiceConfig.getSingleMember + '/' + moduleId)
            .then(res => {
                setLoader(false);
                if (res.data.results.data) {
                    const result = res.data.results.data;
                    const avatarUrl = (result.avatar) ? result.avatar : `https://ui-avatars.com/api/?name=${result.first_name}+${result.last_name}`;
                    setCountryData(result.country_list);
                    setAccountNotes(result.MemberNotes);
                    setStatus(result.status);
                    setAdminStatus(result.admin_status);
                    setSurveyDetails(result.survey);
                    if(result.dob){
                        setDob(result.dob);
                    }
                    result.MemberPaymentInformations.length > 0 ? setPaymentEmail(result.MemberPaymentInformations[0].value) : '';
                    // updateAvatar params has been set to not to change the avatar url after updating the value. 
                    // Because AWS S3 is taking time to update the image. Until reload the browser, updating avatar value is taking from JS State.
                    updateAvatar && setAvatar(avatarUrl);
                    setMemberData({ ...result, membership_tier_id: result.MembershipTier?.id, avatar: avatarUrl });
                    // We set the result info to the state. When user click on cancel edit btn then we will set the value on every input fields from this memberinfo state.
                    setMemberinfo(result);
                    /*if (result.deleted_at && result.deleted_by && result.deleted_by_admin) {
                        props.setDeletedMemberData({
                            deleted_at: result.deleted_at,
                            deleted_by: result.deleted_by,
                            deleted_by_admin: result.deleted_by_admin
                        })
                        props.setIsMemberDeleted(true)
                    }*/
                    if (result.is_deleted) {
                        setMemberDeleted(true)
                    }
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.message }));
            })
    }

    useEffect(() => {
        getMemberData();
    }, [location]);

    /**
     * Phone no. Validation
     */
    const handlePhoneValidation = (e) => {
        const reg = /^[0-9\b]+$/;
        if (e.target.value === '' || reg.test(e.target.value))
            setMemberData({ ...memberData, phone_no: e.target.value })
        else
            e.target.value = memberData.phone_no;
    }

    /**
     * Show Phone Country Code
     */
    const phoneCountryCode = () => {
        const filterData = countryData.filter(c => c.id == memberData.country_code);
        return filterData.length ? filterData[0].phonecode : ''
    }

    /**
     * Member's Data Update
     */
    const handleFormSubmit = () => {
        const fields = ["username", "first_name", "last_name", "country_code", "zip_code", "address_1", "address_2", "city", "country_id", "membership_tier_id", "phone_no", "gender"];
        const formdata = new FormData();
        formdata.append("avatar", avatarFile);
        formdata.append("type", 'basic_details');
        formdata.append("dob", moment(dob).format("YYYY-MM-DD HH:mm:ss"));
        for (const field of fields) {
            formdata.append(field, memberData[field] ? memberData[field] : '');
        }
        onCloseAlertDialogHandle();
        updateMemberData(formdata, 'basic_details');
    }

    /**
     * Update member info
     */
    const updateMemberData = (formdata, type) => {
        setActionLoader(true);
        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, formdata)
            .then(res => {
                if (res.data.results.message) {
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                    setActionLoader(false);
                    if (type === "member_status") {
                        setEditStatus(false);
                        setDialogStatus(false);
                        setStatusNote('');
                        setStatuslessNote(false);
                        setBtnLoading(false);
                        setSkipBtnLoading(false);
                    } else {
                        setEditMode(false);
                        setEditPaymentEmail(false);
                        setEditAdminStatus(false);
                    }
                    // Get latest data from API
                    getMemberData(false);
                }
            })
            .catch(errors => {
                setActionLoader(false);
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }
    const handleUpdatePaymentEmail = () => {
        if (paymentEmail && Helper.validateEmail(paymentEmail)) {
            updateMemberData({ type: 'payment_email', email: paymentEmail }, 'payment_email');
        } else {
            dispatch(showMessage({ variant: 'error', message: 'Enter valid payment email' }));
        }
    }
    const countryProps = {
        options: countryData,
        getOptionLabel: (option) => option.name,
    };

    const countryCodeProps = {
        options: countryData,
        getOptionLabel: (option) => option.name + ' (' + option.phonecode + ')',
    };

    const showStatus = (status) => {
        if (status === 'member')
            return <Chip component="span" label={status} className="capitalize" color="success" sx={chipStyle} />
        else if (status === 'suspended')
            return <Chip component="span" label={status} className="capitalize" color="primary" sx={chipStyle} />
        else if (status === 'validating')
            return <Chip component="span" label={status} className="capitalize" color="warning" sx={chipStyle} />
        else if (status === 'deleted')
            return <Chip component="span" label={status} className="capitalize" color="error" sx={chipStyle} />
    }

    const showAdminStatus = (status) => {
        if (status === 'verified')
            return <Chip component="span" label={status} className="capitalize" color="success" sx={chipStyle} />
        else if (status === 'pending')
            return <Chip component="span" label={status} className="capitalize" color="warning" sx={chipStyle} />
        else if (status === 'not_verified')
            return <Chip component="span" label={status.split('_').join(' ')} className="capitalize" color="error" sx={chipStyle} />
    }

    const handleSetAvatar = (response) => {
        setAvatar(response);
    }

    const handleSetAvatarFile = (response) => {
        setAvatarFile(response);
    }

    /**
     * Change member's status
     */
    const handleChangeStatus = (type) => {
        const params = {
            value: status,
            field_name: "status",
            member_id: memberData.id,
            type: "member_status",
            member_notes: type === 'save' ? statusNote : ''
        }
        if(type === 'save')
            setBtnLoading(true);
        else
            setSkipBtnLoading(true);
        updateMemberData(params, "member_status");
    }

    const handleCancelStatus = () => {
        setStatuslessNote(false);
        setEditStatus(false);
        setDialogStatus(false);
        setStatus(memberData.status);
        setStatusNote('');
    }

    /**
     * Delete Account
     */
    const deleteAccount = () => {
        onCloseAlertDialogHandle();
        setActionLoader(true);
        axios.delete(jwtServiceConfig.memberDelete, { data: { model_ids: [moduleId], 'permanet_delete': true } })
            .then(res => {
                if (res.data.results.message) {
                    setActionLoader(false);
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                    navigate('/app/members');
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }

    const showBalance = (type) => {
        if (type === 'balance') {
            if (memberData.total_earnings && memberData.total_earnings.earnings) {
                const result = memberData.total_earnings.earnings.filter(item => item.amount_type === 'cash');
                return result.length ? result[0].total_amount : 0
            }
        } else {
            if (memberData.total_earnings && memberData.total_earnings.total) {
                return memberData.total_earnings.total
            }
        }
        return 0;

    }

    const getCountryName = (country_id) => {
        const result = countryData.filter(c => c.id == country_id);
        return result.length ? result[0].name : ''
    }

    const handleCancelEdit = () => {
        setEditMode(false);

        /**
         * setAvatar setting initial avatar value. 
         * we set this because user may have edit the avatar after clicking the edit button.
         */
        setAvatar(memberData.avatar);
        setMemberData({ ...memberinfo, membership_tier_id: memberinfo.MembershipTier.id, avatar: memberData.avatarUrl });
    }

    const sendVerificationEmail = () => {
        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, { type: 'resend_verify_email' })
            .then(res => {
                if (res.data.results.message) {
                    dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                    setActionLoader(false);
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }

    const impersonateAccount = () => {
        onCloseAlertDialogHandle();
        window.open('//'+memberData.impersonation_link, "_blank");
    };

    /**
     * Unlink Referrer
     */
    const removeReferrer = () => {
        onCloseAlertDialogHandle();
        updateMemberData({ type: 'unlink_referrer', member_id: moduleId }, 'unlink_referrer');
    }

    if (loader) {
        return (
            <BackdropLoader />
        )
    }
    return (
        <Box
            className={'p-12 sm:p-16 lg:p-16 md:p-16 flex flex-col lg:flex-col h-full ' + ((memberDeleted) ? 'border-4 lg:pt-0 sm:pt-0 md:pt-0' : '')}
            style={{ borderColor: (memberDeleted) ? '#f44336' : 'none' }}
        >
            {memberDeleted && <StickyMessage />}
            <div className={'flex xl:flex-row lg:flex-row flex-col w-full ' + ((memberDeleted) ? 'lg:mt-10' : '')}>
                <div className="lg:w-1/3 xl:w-2/5">
                    <div className='flex items-start justify-between'>
                        <div className='flex items-center justify-between'>
                            {
                                editMode ? (
                                    <>
                                        <TextField
                                            id="standard-helperText"
                                            defaultValue={memberData.username}
                                            variant="standard"
                                            className="xl:w-full md:w-full lg:w-full"
                                            placeholder="Last Name"
                                            sx={textFieldStyle}
                                            onChange={
                                                (e) => setMemberData({ ...memberData, username: e.target.value })
                                            }
                                        />
                                        <Tooltip title="Click to save" placement="top-start">
                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => onOpenAlertDialogHandle('save_profile')}>
                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">feather:save</FuseSvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Click to cancel" placement="top-start">
                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={handleCancelEdit}>
                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:cancel</FuseSvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            marginRight: '10px',
                                            '@media screen and (max-width: 1600px)': {
                                                fontSize: '2rem'
                                            },
                                            '@media screen and (max-width: 1400px)': {
                                                fontSize: '1.4rem'
                                            },
                                            '@media screen and (max-width: 1200px)': {
                                                fontSize: '2rem'
                                            },
                                            '@media screen and (max-width: 768px)': {
                                                fontSize: '3rem'
                                            },
                                            '@media screen and (max-width: 575px)': {
                                                fontSize: '2rem'
                                            }
                                        }}
                                    >
                                        <strong>{memberData.username}</strong>
                                        {
                                            !memberDeleted && (
                                                <Tooltip title="Click to edit" placement="top-start">
                                                    <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditMode(true)}>
                                                        <FuseSvgIcon sx={iconStyle} className="text-28" size={14} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        }

                                    </Typography>
                                )
                            }
                        </div>
                        <div className='lg:flex justify-center sm:hidden'>
                            <MemberAvatar
                                avatar={avatar}
                                editMode={editMode}
                                handleSetAvatar={handleSetAvatar}
                                handleSetAvatarFile={handleSetAvatarFile}
                                memberData={memberData}
                                iconStyle={iconStyle}
                            />
                        </div>
                    </div>
                    <div className='flex items-center xl:flex-col md:flex-row lg:flex-col sm:flex-row md:flex-wrap xmb-10 sm:justify-around'>
                        <div className='md:w-1/3 xl:w-full sm:w-1/3 sm:flex justify-center lg:hidden hidden'>
                            <MemberAvatar
                                avatar={avatar}
                                editMode={editMode}
                                handleSetAvatar={handleSetAvatar}
                                handleSetAvatarFile={handleSetAvatarFile}
                                memberData={memberData}
                                iconStyle={iconStyle}
                            />
                        </div>
                        <div className='flex flex-col xl:w-full lg:w-full md:w-2/3 sm:w-2/3 sm:w-auto w-full'>
                            <List className="">
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>ID:</Typography>
                                    } />
                                    <ListItemText component="div" className="w-1/2 sm:w-3/4 md:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <div className='flex items-center'>
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-base xl:text-base text-sm">{memberData.id}</Typography>
                                            {
                                                (user.role.includes('super-admin') && memberData.deleted_at === null) && (
                                                    <Tooltip title="Impersonate me" placement="top-start" >
                                                        <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={()=>onOpenAlertDialogHandle('impersonate')}>
                                                            <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            }
                                        </div>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Status:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <>
                                            {
                                                editStatus ? (
                                                    <div className='flex items-center'>
                                                        <TextField
                                                            sx={{
                                                                ...selectStyle,
                                                                ...textFieldStyle
                                                            }}
                                                            id="standard-select-currency-native"
                                                            select
                                                            value={status}
                                                            SelectProps={{
                                                                native: true,
                                                            }}
                                                            onChange={
                                                                (e) => {
                                                                    if (e.target.value) {
                                                                        setStatus(e.target.value);
                                                                        setDialogStatus(true);
                                                                    }
                                                                }
                                                            }
                                                            variant="standard"
                                                        >
                                                            <option value="">--Select--</option>
                                                            <option value="validating">Validating</option>
                                                            <option value="member">Member</option>
                                                            <option value="suspended">Suspended</option>
                                                            <option value="deleted">Deleted</option>
                                                        </TextField>
                                                        {/* <Tooltip title="Change Status" placement="top-start" onClick={ ()=>setEditStatus(true) }>
                                                            <IconButton color="primary" aria-label="Filter" component="span">
                                                                <FuseSvgIcon className="text-48" size={18} color="action">material-outline:check</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip> */}
                                                        <Tooltip title="Cancel" placement="top-start" >
                                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={handleCancelStatus}>
                                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:cancel</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                ) : (
                                                    <div className='flex'>
                                                        {showStatus(memberData.status)}
                                                        {
                                                            !memberDeleted && (
                                                                <Tooltip title="Change Status" placement="top-start">
                                                                    <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditStatus(true)}>
                                                                        <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">heroicons-outline:pencil</FuseSvgIcon>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )
                                                        }

                                                    </div>
                                                )
                                            }
                                        </>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Admin Status:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <>
                                            {
                                                editAdminStatus ? (
                                                    <div className='flex items-center'>
                                                        <TextField
                                                            sx={{
                                                                ...selectStyle,
                                                                ...textFieldStyle
                                                            }}
                                                            id="standard-select-currency-native"
                                                            select
                                                            value={adminStatus}
                                                            SelectProps={{
                                                                native: true,
                                                            }}
                                                            onChange={
                                                                (e) => {
                                                                    if (e.target.value) {
                                                                        setAdminStatus(e.target.value);
                                                                    }
                                                                }
                                                            }
                                                            variant="standard"
                                                        >
                                                            <option value="">--Select--</option>
                                                            <option value="not_verified">Not Verified</option>
                                                            <option value="pending">Pending</option>
                                                            <option value="verified">Verified</option>
                                                        </TextField>
                                                        <Tooltip title="Cancel" placement="top-start" >
                                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditAdminStatus(false)}>
                                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:cancel</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Save admin status" placement="top-start" >
                                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => { updateMemberData({ field_name: 'admin_status', type: 'admin_status', value: adminStatus }, 'admin_status'); }} >
                                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:check</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                ) : (
                                                    <div className='flex'>
                                                        {showAdminStatus(memberData.admin_status)}
                                                        {
                                                            !memberDeleted && (
                                                                <Tooltip title="Change Status" placement="top-start">
                                                                    <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditAdminStatus(true)}>
                                                                        <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">heroicons-outline:pencil</FuseSvgIcon>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )
                                                        }

                                                    </div>
                                                )
                                            }

                                        </>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Name:</Typography>
                                    } />
                                    <ListItemText sx={listItemTextStyle} className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" primary={
                                        editMode ? (
                                            <div className='flex md:flex-col xl:flex-row w-full justify-between'>
                                                <TextField
                                                    id="standard-helperText"
                                                    defaultValue={memberData.first_name}
                                                    variant="standard"
                                                    placeholder="First Name"
                                                    sx={textFieldStyle}
                                                    className="xl:w-1/2 md:w-2/5 lg:w-full"
                                                    onChange={
                                                        (e) => setMemberData({ ...memberData, first_name: e.target.value })
                                                    }
                                                />
                                                <TextField
                                                    id="standard-helperText"
                                                    defaultValue={memberData.last_name}
                                                    variant="standard"
                                                    className="xl:w-2/5 md:w-2/5 lg:w-full"
                                                    placeholder="Last Name"
                                                    sx={textFieldStyle}
                                                    onChange={
                                                        (e) => setMemberData({ ...memberData, last_name: e.target.value })
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{memberData.first_name + ' ' + memberData.last_name}</Typography>
                                        )
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Email:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" primary={
                                        <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                            <a href={`mailto:${memberData.email}`} style={{ textDecoration: 'none', color: '#1e293b' }}>{memberData.email}</a>
                                            {status === 'validating' && <Tooltip title="Send verification email" placement="top-start" >
                                                <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => sendVerificationEmail()}>
                                                    <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:email</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>}
                                        </Typography>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Payment Email:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        editPaymentEmail ? (
                                            <div className="flex items-center">
                                                <TextField
                                                    value={paymentEmail}
                                                    onChange={(e) => { setPaymentEmail(e.target.value); }}
                                                    variant="standard"
                                                />
                                                <Tooltip title="Cancel" placement="top-start" >
                                                    <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditPaymentEmail(false)}>
                                                        <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:cancel</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Save payment email" placement="top-start" >
                                                    <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => { handleUpdatePaymentEmail() }} >
                                                        <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">material-outline:check</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        ) : (
                                            <div className='flex items-center break-all'>
                                                <Typography variant="body1" className="flex sm:text-lg lg:text-sm xl:text-base text-sm">
                                                    {memberData.MemberPaymentInformations && memberData.MemberPaymentInformations.length > 0 ? memberData.MemberPaymentInformations[0].value : '--'}
                                                </Typography>
                                                {
                                                    !memberDeleted && (
                                                        <Tooltip title="Change Payment Email" placement="top-start">
                                                            <IconButton color="primary" aria-label="Filter" component="span" sx={iconLabel} onClick={() => setEditPaymentEmail(true)}>
                                                                <FuseSvgIcon sx={iconStyle} className="text-48" size={14} color="action">heroicons-outline:pencil</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip>
                                                    )
                                                }
                                            </div>
                                        )
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Default <br/>Payment Method:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <PaymentMethodUpdate 
                                            memberData={memberData} 
                                            iconStyle={iconStyle} 
                                            iconLabel={iconLabel} 
                                            updateMemberData={updateMemberData} 
                                        />
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Referral Code:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <div className="flex items-center">
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                {memberData.referral_code ?? '--'}
                                            </Typography>
                                            {
                                                (memberData.referral_code) && (
                                                    <Tooltip title="Click to copy" placement="right">
                                                        <IconButton color="primary" aria-label="Filter" sx={iconLabel} component="span" className="cursor-pointer" onClick={() => clickToCopy(memberData.referral_code)}>
                                                            <FuseSvgIcon className="text-48" sx={iconStyle} size={16} color="action" >material-solid:content_copy</FuseSvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            }
                                        </div>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Referral Link:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <div className="items-center">
                                            {
                                                (memberData.referral_link) ? (
                                                    <>
                                                        {
                                                            reflinkMode && (
                                                                <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base">
                                                                    {memberData.referral_link}
                                                                </Typography>
                                                            )
                                                        }
                                                        <Tooltip title={memberData.referral_link} placement="top">
                                                            <Button variant="contained" size="small" onClick={() => setReflinkMode(!reflinkMode)} sx={chipStyle}>{!reflinkMode ? 'Show' : 'Hide'}</Button>
                                                        </Tooltip>
                                                        <Tooltip title="Click to copy" placement="right">
                                                            <IconButton color="primary" aria-label="Filter" sx={iconLabel} component="span" className="cursor-pointer" onClick={() => clickToCopy(memberData.referral_link)}>
                                                                <FuseSvgIcon className="text-48" sx={iconStyle} size={16} color="action" >material-solid:content_copy</FuseSvgIcon>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : '--'
                                            }
                                        </div>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Referrer:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        (memberData.MemberReferral && memberData.member_referral_id && memberData.member_referrer) ? (
                                            <div className='flex items-center'>
                                                <AnchorLink href={`/app/members/${memberData.member_referral_id}`} target="_blank">
                                                    <Typography variant="body1" className="sm:text-lg lg:text-sm xl:text-base  text-sm break-all">
                                                        {memberData.member_referrer} {/** ({memberData.MemberReferral.ip}) */}
                                                    </Typography>
                                                </AnchorLink>
                                                <Tooltip title={'IP Address: ' + memberData.MemberReferral.ip} placement="right">
                                                    <IconButton color="primary" aria-label="show-ip" sx={iconLabel} component="span">
                                                        <FuseSvgIcon className="text-48" size={16} color="action">material-outline:info</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                                {/* <Tooltip title="Go to referrer account" placement="right">
                                                    <Link to={`/app/members/${memberData.member_referral_id}`} style={{ textDecoration: 'none', color: '#1e293b' }}>
                                                        <IconButton color="primary" aria-label="external-link" sx={iconLabel} component="span">
                                                            <FuseSvgIcon className="text-48" size={16} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                        </IconButton>
                                                    </Link>
                                                </Tooltip> */}
                                                <Tooltip title="Unlink referrer" placement="right">
                                                    <IconButton color="primary" aria-label="unlink_referrer" sx={iconLabel} component="span" className="cursor-pointer" onClick={() => onOpenAlertDialogHandle('unlink_referrer')}>
                                                        <FuseSvgIcon className="text-48" sx={iconStyle} size={16} color="action" >material-solid:link_off</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        ) : '--'
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Level:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        editMode ? (
                                            <div className="xl:w-1/2 sm:w-full">
                                                <TextField
                                                    sx={{ ...selectStyle, ...textFieldStyle }}
                                                    id="standard-select-currency-native"
                                                    select
                                                    value={memberData.MembershipTier ? memberData.MembershipTier.id : ''}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    variant="standard"
                                                    onChange={
                                                        (e) => {
                                                            setMemberData({
                                                                ...memberData,
                                                                'MembershipTier': {
                                                                    name: e.target.value
                                                                },
                                                                'membership_tier_id': e.target.value
                                                            })
                                                        }
                                                    }
                                                >
                                                    <option value="">--Select--</option>
                                                    {memberData.membership_tier.map(val => (
                                                        <option value={val.id} key={val.id}>{val.name}</option>
                                                    ))}
                                                </TextField>
                                            </div>
                                        ) : (
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{memberData.MembershipTier ? memberData.MembershipTier.name : '--'}</Typography>
                                        )

                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Phone:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        editMode ? (
                                            <div className='flex lg:flex-col xl:flex-row justify-between w-full'>
                                                <Autocomplete
                                                    {...countryCodeProps}
                                                    className="sm:w-3/4 xl:w-2/4 sm:mr-10 md:mr-0 md:w-2/4 lg:w-full"
                                                    sx={autoCompleteStyle}
                                                    id="clear-on-escape"
                                                    value={countryData.filter(c => c.id == memberData.country_code)[0]}
                                                    clearOnEscape
                                                    onChange={(e, newValue) => setMemberData({ ...memberData, country_code: newValue.id })}
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="standard" sx={{ ...textFieldStyle }} />
                                                    )}
                                                />
                                                <TextField
                                                    type="tel"
                                                    className="xl:w-2/5 md:w-2/5 lg:w-full"
                                                    id="standard-helperText"
                                                    defaultValue={memberData.phone_no}
                                                    variant="standard"
                                                    sx={textFieldStyle}
                                                    onKeyUp={handlePhoneValidation}
                                                />
                                            </div>
                                        ) : (
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                {
                                                    (memberData.country_code && memberData.phone_no) ? `(${phoneCountryCode()}) ` + memberData.phone_no : '--'
                                                }
                                            </Typography>
                                        )
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Gender:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        editMode ? (
                                            <div className="xl:w-1/2 sm:w-full">
                                                <TextField
                                                    sx={{ ...selectStyle, ...textFieldStyle }}
                                                    id="standard-select-currency-native"
                                                    select
                                                    value={memberData.gender}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    variant="standard"
                                                    onChange={
                                                        (e) => setMemberData({
                                                            ...memberData,
                                                            gender: e.target.value
                                                        })
                                                    }
                                                >
                                                    <option value="">--Select--</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </TextField>
                                            </div>
                                        ) : (
                                            <Typography variant="body1" className="capitalize sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                {memberData.gender ?? '--'}
                                            </Typography>
                                        )
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>DOB:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        editMode ? (
                                            <div className='flex lg:flex-col xl:flex-row justify-between w-full'>
                                                
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <DatePicker
                                                        value={dob}
                                                        maxDate={new Date()}
                                                        onChange={(newValue) => {
                                                            setDob(newValue);
                                                        }}
                                                        readOnly={false}
                                                        renderInput={(params) => (
                                                            <TextField 
                                                                {...params} 
                                                                className="xl:w-1/2 md:w-2/5 lg:w-full"
                                                                id="standard-helperText"
                                                                variant="standard"
                                                                sx={textFieldStyle}
                                                            />
                                                        )}
                                                    />
                                                </LocalizationProvider>
                                            </div>
                                        ) : (
                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                {
                                                    memberData.dob ?? '--'
                                                }
                                            </Typography>
                                        )
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="w-1/5 sm:w-1/4 md:w-1/4 lg:w-1/3 xl:w-3/12" sx={listItemTextStyle} primary={
                                        <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Joining Date:</Typography>
                                    } />
                                    <ListItemText className="w-1/2 sm:w-3/4 lg:w-2/3 xl:w-9/12" sx={listItemTextStyle} primary={
                                        <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                            { moment(memberData.created_at).format('MMMM Do YYYY, HH:mm:ss') }
                                        </Typography>
                                    } />
                                </ListItem>
                                
                            </List>
                        </div>
                    </div>
                    <div className='flex lg:flex-col sm:flex-row flex-col items-center justify-between'>
                        <Box
                            className="lg:mb-10 sm:mb-0 bg-gray-300 sm:w-2/3 lg:w-full w-full my-10"
                            sx={{
                                height: 'auto',
                                p: 1.8
                            }}
                        >
                            <Typography variant="body1" className="lg:mb-5 sm:mb-10 xl:mb-10 font-medium text-sm sm:text-base md:text-lg lg:text-lg">
                                Balance($): {showBalance('balance')} <br /> (Total Earnings: ${showBalance('total')})
                            </Typography>
                            {/* <Typography variant="body1" className="lg:mb-5 sm:mb-10 xl:mb-10 font-medium">
                                Adjustment: {memberData.total_earnings && memberData.total_earnings.total_adjustment ? '$' + memberData.total_earnings.total_adjustment : 0}
                            </Typography> */}
                            <Adjustment updateMemberData={updateMemberData} totalEarnings={memberData.total_earnings} memberDeleted={memberDeleted} />
                        </Box>

                        <div className='sm:w-1/4 lg:w-full lg:text-left sm:text-center w-full'>
                            <Typography variant="body1" className="mb-5">Login as this account</Typography>
                            <Button variant="outlined" size="small" color="error" onClick={() => onOpenAlertDialogHandle('delete')} sx={{ padding: '4px 15px' }}>DELETE PERMANENTLY</Button>
                        </div>
                    </div>
                </div>
                <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3 }} className="my-10 sm:mx-10 lg:mx-10 xl:24 hidden md:flex" />
                <Divider orientation="horizontal" flexItem sx={{ borderWidth: 2 }} className="md:my-16 sm:my-16 xl:24 lg:hidden my-5" />
                <div className="lg:w-2/3 xl:w-3/5">
                    <div className='flex flex-col'>
                        <div className='flex sm:flex-row flex-col'>
                            <div className='w-full sm:w-1/2'>
                                <div className='mb-16'>
                                    <Typography
                                        className="font-bold"
                                        variant="body1"
                                    >Additional Information</Typography>
                                    <List>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>Geo Location:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{(memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].geo_location : '--'}</Typography>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>IP:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{(memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].ip : '--'}</Typography>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>Browser:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{(memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].browser : '--'}</Typography>
                                            } />
                                        </ListItem>
                                    </List>
                                </div>
                                <div className=''>
                                    <Typography
                                        variant="body1"
                                        className="font-bold"
                                    >Address</Typography>
                                    <List>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>Address Line 1:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <>
                                                    {
                                                        editMode ? (
                                                            <TextField
                                                                type="text"
                                                                id="standard-helperText"
                                                                defaultValue={memberData.address_1}
                                                                variant="standard"
                                                                sx={textFieldStyle}
                                                                onChange={
                                                                    (e) => setMemberData({ ...memberData, address_1: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{memberData.address_1 ?? '--'}</Typography>
                                                        )
                                                    }
                                                </>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>Address Line 2:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <>
                                                    {
                                                        editMode ? (
                                                            <TextField
                                                                type="text"
                                                                id="standard-helperText"
                                                                defaultValue={memberData.address_2}
                                                                variant="standard"
                                                                sx={textFieldStyle}
                                                                onChange={
                                                                    (e) => setMemberData({ ...memberData, address_2: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                                {memberData.address_2 ? memberData.address_2 : '--'}
                                                            </Typography>
                                                        )
                                                    }
                                                </>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>City:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <>
                                                    {
                                                        editMode ? (
                                                            <TextField
                                                                type="text"
                                                                id="standard-helperText"
                                                                defaultValue={memberData.city}
                                                                variant="standard"
                                                                sx={textFieldStyle}
                                                                onChange={
                                                                    (e) => setMemberData({ ...memberData, city: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" className="sm:text-lg  md:text-lg lg:text-sm xl:text-base text-sm">
                                                                {memberData.city ? memberData.city : '--'}
                                                            </Typography>
                                                        )
                                                    }
                                                </>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>ZIP Code:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <>
                                                    {
                                                        editMode ? (
                                                            <TextField
                                                                type="tel"
                                                                id="standard-helperText"
                                                                defaultValue={memberData.zip_code}
                                                                variant="standard"
                                                                sx={textFieldStyle}
                                                                onChange={
                                                                    (e) => setMemberData({ ...memberData, zip_code: e.target.value })
                                                                }
                                                            />
                                                        ) : (
                                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">{memberData.zip_code ??  '--'}</Typography>
                                                        )
                                                    }
                                                </>
                                            } />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemText className="w-1/5 sm:w-2/5 md:w-2/5 lg:w-2/5 xl:w-1/3" sx={listItemTextStyle} primary={
                                                <Typography variant="subtitle" sx={labelStyling}>Country:</Typography>
                                            } />
                                            <ListItemText className="w-1/2 sm:w-3/5 md:3/5 lg:w-3/5 xl:w-2/3" sx={listItemTextStyle} primary={
                                                <>
                                                    {
                                                        editMode ? (
                                                            <Autocomplete
                                                                className="w-full"
                                                                {...countryProps}
                                                                value={countryData.filter(c => c.id == memberData.country_id)[0]}
                                                                sx={autoCompleteStyle}
                                                                id="clear-on-escape"
                                                                onChange={
                                                                    (e, newValue) => setMemberData({ ...memberData, country_id: newValue.id })
                                                                }
                                                                clearOnEscape
                                                                renderInput={(params) => (
                                                                    <TextField {...params} variant="standard" sx={{ width: '100%', ...textFieldStyle }} />
                                                                )}
                                                            />

                                                        ) : (
                                                            <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm">
                                                                {memberData.country_id ? getCountryName(memberData.country_id) : '--'}
                                                            </Typography>
                                                        )
                                                    }
                                                </>
                                            } />
                                        </ListItem>
                                    </List>
                                </div>
                            </div>
                            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3 }} className="md:my-20 sm:my-20 sm:mx-10 lg:mx-16 xl:24 hidden sm:flex" />
                            <div className='hidden sm:flex w-1/2'>
                                <SurveyDetails surveyData={surveyDetails} />
                            </div>
                        </div>

                        <Divider sx={{ borderWidth: 2 }} className="my-5" />
                        <Box component="div" className="w-full flex flex-col">
                            <Typography variant="body1" className="font-bold flex">Account Notes Section
                                {
                                    !memberDeleted && (
                                        <Tooltip title="Add Note" placement="right">
                                            <FuseSvgIcon className="text-48 cursor-pointer" size={24} color="action" onClick={() => { setStatuslessNote(true); setDialogStatus(true) }} >heroicons-solid:plus</FuseSvgIcon>
                                        </Tooltip>
                                    )
                                }
                            </Typography>
                            {
                                (accountNotes.length != 0) ? (
                                    <AccountNotes accountNotes={accountNotes} memberNoteDeleted={memberNoteDeleted} memberDeleted={memberDeleted} />
                                ) : (
                                    <Typography variant="body1" className="italic text-grey-500">No records found!</Typography>
                                )
                            }
                        </Box>
                        <Divider sx={{ borderWidth: 2 }} className="mt-5 sm:hidden" />
                        <div className='w-full sm:hidden'>
                            <SurveyDetails surveyData={surveyDetails} />
                        </div>
                    </div>
                </div>
            </div>
            {
                openAlertDialog && (
                    <AlertDialog
                        content={<span dangerouslySetInnerHTML={{ __html: msg }}></span>}
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
            {
                dialogStatus && (
                    <Dialog open={dialogStatus} onClose={() => { setStatuslessNote(false); setDialogStatus(false) }} fullWidth={true}>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogContent className="p-32 mt-10">
                            <TextareaAutosize
                                maxRows={8}
                                aria-label="maximum height"
                                placeholder="Add note"
                                defaultValue={statusNote}
                                style={{ width: '100%', height: '100px' }}
                                className="border"
                                onChange={(e) => setStatusNote(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions className="px-32 py-20">
                            <Button className="mr-auto" variant="outlined" color="error" onClick={handleCancelStatus}>Cancel</Button>
                            {
                                !statuslessNote && (
                                    <LoadingButton variant="outlined" color="primary" loading={skipBtnLoading} onClick={(e) => { e.preventDefault(); handleChangeStatus('skip') }}>Skip & Save</LoadingButton>
                                )
                            }
                            <LoadingButton color="primary" loading={btnloading} variant="contained" onClick={(e) => { e.preventDefault(); handleChangeStatus('save') }} disabled={statusNote ? false : true}>Save</LoadingButton>
                        </DialogActions>
                    </Dialog>
                )
            }
            {
                actionLoader && <BackdropLoader />
            }
        </Box>
    )
}

export default MemberDetails;