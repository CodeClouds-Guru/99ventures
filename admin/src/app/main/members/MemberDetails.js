import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, useRef} from 'react';
import { Box, Avatar, Stack, Divider, IconButton, Typography, TextField, Autocomplete, Chip, Dialog, DialogTitle, DialogActions, DialogContent, Button, List, ListItem, ListItemIcon, ListItemText,  TextareaAutosize, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import AccountNotes from './components/AccountNotes';
import { useDispatch } from 'react-redux';
import axios from 'axios'
import Adjustment from './components/Adjustment';
import SurveyDetails from './components/SurveyDetails';


const labelStyling = {
    '@media screen and (max-width: 1024px)': {
        fontSize: '1.7rem'
    },
    '@media screen and (max-width: 768px)': {
        fontSize: '1.4rem'
    }
} 

const textFieldStyle = {
    width: '100%',
    '& .muiltr-r11gs3-MuiInputBase-root-MuiInput-root': {
        minHeight: '30px'
    }
}

const iconStyle = {
    '@media screen and (max-width: 1400px)': {
        width: '17px',
        height: '17px',
        minWidth: '17px',
        minHeight: '17px',
        fontSize: '17px',
        lineHeight: 17
    }
}

const selectStyle = {
    // minWidth: '220px',
    // '@media screen and (max-width: 1400px)': {
    //     minWidth: '100%'
    // }
}

const listItemTextStyle = {
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

const MemberDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const avatarRef = useRef();
    const { moduleId } = useParams();
    const [ editMode, setEditMode ] = useState(false);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ alertType, setAlertType ] = useState('');
    const [ msg, setMsg ] = useState('');
    const [ memberData, setMemberData ] = useState({});
    const [ countryData, setCountryData ] = useState([]);
    const [ avatar, setAvatar ] = useState('');
    const [ avatarFile, setAvatarFile ] = useState('');
    const [ accountNotes, setAccountNotes ] = useState([]);
    const [ dialogStatus, setDialogStatus ] = useState(false);
    const [ editStatus, setEditStatus ] = useState(false);
    const [ statusNote, setStatusNote ] = useState('');
    const [ status, setStatus ] = useState('');
    const [ surveyDetails, setSurveyDetails ] = useState([]);

    const onOpenAlertDialogHandle = (type) => {
        var msg = '';
        if(type === 'delete')
            msg = 'Do you want to delete your account?';
        else if(type === 'save_profile')
            msg = 'Do you want to save changes?';
        else if(type === 'adjustment')
            msg = 'Do you want to adjust the amount?'

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
        if(alertType === 'save_profile') {
            handleFormSubmit();
        } else if(alertType === 'delete') {
            deleteAccount();
        }
    }

    /**
     * Get Member Details
     */
    const getMemberData = (updateAvatar = true) => {
        axios.post(jwtServiceConfig.getSingleMember + '/' + moduleId)
            .then(res => {
                if (res.data.results.data) {
                    const result = res.data.results.data;
                    const avatarUrl = (result.avatar) ? result.avatar : `https://ui-avatars.com/api/?name=${ result.first_name}+${ result.last_name}`;
                    setCountryData(result.country_list);
                    setAccountNotes(result.MemberNotes);
                    setStatus(result.status); 
                    setSurveyDetails(result.survey);

                    // updateAvatar params has been set to not to change the avatar url after updating the value. 
                    // Because AWS S3 is taking time to update the image. Until reload the browser, updating avatar value is taking from JS State.
                    updateAvatar && setAvatar(avatarUrl);

                    setMemberData({...result, membership_tier_id: result.MembershipTier.name, avatar: avatarUrl});
                }
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.message}));
            })
    }

    useEffect(()=>{
        getMemberData();
    }, [location]);

    /**
     * Phone no. Validation
     */
    const handlePhoneValidation = (e) => {
        const reg = /^[0-9\b]+$/;
        if (e.target.value === '' || reg.test(e.target.value)) 
            setMemberData({...memberData, phone_no: e.target.value })        
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
        const fields = ["first_name", "last_name", "country_code", "zip_code", "address_1", "address_2", "address_3", "country_id", "membership_tier_id", "phone_no"];
        const formdata = new FormData();
        formdata.append("avatar", avatarFile);
        formdata.append("type", 'basic_details');
        for(const field of fields) {
            formdata.append(field, memberData[field] ? memberData[field] : '');
        }
        onCloseAlertDialogHandle();
        updateMemberData(formdata, 'basic_details');        
    }

    const updateMemberData = (formdata, type) => {
        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, formdata)
        .then(res => {
            if (res.data.results.message) {
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                if(type === "member_status"){
                    setEditStatus(false);
                    setDialogStatus(false);
                    setStatusNote('');
                } else {
                    setEditMode(false);
                }
                getMemberData(false);
            }
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
        });
    }

    const countryProps = {
        options: countryData,
        getOptionLabel: (option) => option.name,
    };

    const countryCodeProps = {
        options: countryData,
        getOptionLabel: (option) => option.name + ' ('+ option.phonecode +')',
    };

    const showStatus = (status) => {
        if(status === 'member') 
            return <Chip component="span" label={status} className="capitalize" color="success" />
        else if(status === 'suspended') 
            return <Chip component="span" label={status} className="capitalize" color="primary" />
        else if(status === 'validating') 
            return <Chip component="span" label={status} className="capitalize" color="warning" />
        else if(status === 'deleted') 
            return <Chip component="span" label={status} className="capitalize" color="error" />
    }

    async function readFileAsync(e) {
        const response = await new Promise((resolve, reject) => {
            const file = e.target.files[0];       
            setAvatarFile(file);     
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                resolve(`data:${file.type};base64,${btoa(reader.result)}`);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        });
        
        setAvatar(response);
    }

    /**
     * Change member's status
     */
    const handleChangeStatus = () => {
        const params = {
            value: status, 
            field_name: "status", 
            member_id: memberData.id, 
            type: "member_status", 
            member_notes: statusNote ? statusNote : null
        }
        updateMemberData(params, "member_status");
    }

    const handleCancelStatus = () => {
        setEditStatus(false);
        setDialogStatus(false);
        setStatus(memberData.status);
        setStatusNote('');
    }

    /**
     * Delete Account
     */
    const deleteAccount = () => {
        axios.delete(jwtServiceConfig.memberDelete, { data: { modelIds: [moduleId] } })
        .then(res => {
            if (res.data.results.message) {
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                navigate('/app/members');
            }
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
        });
    }

    const showBalance = () => {
        if(memberData.total_earnings && memberData.total_earnings.earnings){
            const result = memberData.total_earnings.earnings.filter(item => item.amount_type === 'cash');
            return result.length ? result[0].total_amount : 0
        }
        return 0;
    }

    return (
        <Box className="sm:p-16 lg:p-16 md:p-16 xl:p-16 flex sm:flex-col lg:flex-row" >
            <div className="lg:w-1/3 xl:w-2/5">
                <div className='flex items-center mb-10'>
                    <Typography 
                        variant="h5"
                        sx={{
                            marginRight: '10px',                            
                            '@media screen and (max-width: 1400px)': {
                                fontSize: '2rem'
                            },
                            '@media screen and (max-width: 1400px)': {
                                fontSize: '4rem'
                            },
                            '@media screen and (max-width: 768px)': {
                                fontSize: '3rem'
                            }
                        }}
                    ><strong>{memberData.username}</strong> </Typography>
                    <sub>
                        {
                            !editMode ? (
                                <Tooltip title="Click to edit" placement="top-start">
                                    <IconButton color="primary" aria-label="Filter" component="span" onClick={ ()=> setEditMode(true)}>
                                        <FuseSvgIcon sx={iconStyle} className="text-28" size={20} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <>
                                    <Tooltip title="Click to save" placement="top-start">
                                        <IconButton color="primary" aria-label="Filter" component="span" onClick={ ()=>onOpenAlertDialogHandle('save_profile') }>
                                            <FuseSvgIcon sx={iconStyle} className="text-48" size={20} color="action">feather:save</FuseSvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Click to cancel" placement="top-start">
                                        <IconButton color="primary" aria-label="Filter" component="span" onClick={ ()=> setEditMode(false)}>
                                            <FuseSvgIcon sx={iconStyle} className="text-48" size={20} color="action">material-outline:cancel</FuseSvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                        }
                    </sub>
                </div>
                <div className='flex items-center xl:flex-col md:flex-row lg:flex-col sm:flex-row md:flex-wrap xmb-10 sm:justify-around'>
                    <div className='md:w-1/3 xl:w-full sm:w-1/3 flex justify-center'>
                        <Box
                            sx={{
                                borderWidth: 4,
                                borderStyle: 'solid',
                                borderColor: 'background.paper',
                                width: '10rem',
                                height: '10rem',  
                                '@media screen and (max-width: 1400px)': {
                                    width: '10rem',
                                    height: '10rem',
                                },
                                '@media screen and (max-width: 1280px)': {
                                    width: '16rem',
                                    height: '16rem',
                                },
                                '@media screen and (max-width: 768px)': {
                                    width: '15rem',
                                    height: '15rem',
                                }
                            }}
                            className="shadow-md relative rounded-full overflow-hidden"
                        >
                            {
                                editMode && (
                                    <>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div>
                                                <label htmlFor="button-avatar" className="flex p-8 cursor-pointer">
                                                    <input
                                                        ref={avatarRef}
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="button-avatar"
                                                        type="file"
                                                        onChange={(e) => {                                        
                                                            readFileAsync(e);
                                                        }}
                                                    />
                                                    <Tooltip title="Upload" placement="bottom-start">
                                                        <FuseSvgIcon  sx={iconStyle} className="text-white">heroicons-outline:camera</FuseSvgIcon>
                                                    </Tooltip>
                                                </label>
                                            </div>
                                            <div>
                                                <Tooltip title="Reset" placement="bottom-start">
                                                    <IconButton
                                                        onClick={() => {
                                                            setAvatar(memberData.avatar);
                                                            avatarRef.current.value = ''; // To remove the value from input file
                                                        }}
                                                    >
                                                        <FuseSvgIcon sx={iconStyle} className="text-white text-48" size={24} color="action">feather:rotate-ccw</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </>
                                ) 
                            }     
                            <Avatar
                                sx={{
                                    backgroundColor: 'background.default',
                                    color: 'text.secondary',
                                    '@media screen and (max-width: 768px)': {
                                        width: 60, 
                                        height: 60,                                    
                                    },
                                    '@media screen and (max-width: 1400px)': {
                                        width: 120,
                                        height: 120,                                    
                                    }
                                }}
                                className="object-cover w-full h-full text-20 font-bold"
                                src={ avatar }
                                alt={ `${memberData.first_name} ${memberData.last_name}` }
                            >
                                { avatar }
                            </Avatar>
                        </Box>
                    </div>
                    <div className='flex flex-col xl:w-full lg:w-full md:w-2/3 sm:w-2/3'>
                        <List className="">
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>ID:</Typography>
                                } />
                                <ListItemText className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={
                                    <Typography variant="body1" className="sm:text-sm md:text-lg lg:text-base xl:text-base">{ memberData.id }</Typography>
                                }/>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Status:</Typography>
                                } />
                                <ListItemText className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={ 
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
                                                        value={ status }             
                                                        SelectProps={{
                                                            native: true,
                                                        }}
                                                        onChange={ 
                                                            (e)=> {
                                                                if(e.target.value){
                                                                    setStatus(e.target.value);
                                                                    setDialogStatus(true);
                                                                }
                                                            }
                                                        }
                                                        variant="standard"
                                                        >
                                                        <option value="">--Select--</option>
                                                        <option value="member">Member</option>
                                                        <option value="suspended">Suspended</option>
                                                        <option value="validating">Validating</option>
                                                        <option value="deleted">Deleted</option>
                                                    </TextField>
                                                    {/* <Tooltip title="Change Status" placement="top-start" onClick={ ()=>setEditStatus(true) }>
                                                        <IconButton color="primary" aria-label="Filter" component="span">
                                                            <FuseSvgIcon className="text-48" size={18} color="action">material-outline:check</FuseSvgIcon>
                                                        </IconButton>
                                                    </Tooltip> */}
                                                    <Tooltip title="Cancel" placement="top-start" onClick={ handleCancelStatus }>
                                                        <IconButton color="primary" aria-label="Filter" component="span">
                                                            <FuseSvgIcon className="text-48" size={18} color="action">material-outline:cancel</FuseSvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <div className='flex'>
                                                    <Typography variant="body1" className="sm:text-sm md:text-lg lg:text-base xl:text-base">{ showStatus(memberData.status) }</Typography>
                                                    <Tooltip title="Change Status" placement="top-start" onClick={ ()=>setEditStatus(true) }>
                                                        <IconButton color="primary" aria-label="Filter" component="span">
                                                            <FuseSvgIcon className="text-48" size={18} color="action">heroicons-outline:pencil</FuseSvgIcon>
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            )
                                        }
                                        
                                    </>
                                } />
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Name:</Typography>
                                } />
                                <ListItemText sx={listItemTextStyle} className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={                                    
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
                                                    (e)=> setMemberData({...memberData, first_name: e.target.value})
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
                                                    (e)=> setMemberData({...memberData, last_name: e.target.value})
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <Typography variant="body1" className="sm:text-sm md:text-lg lg:text-base xl:text-base">{ memberData.first_name +' '+ memberData.last_name }</Typography>
                                    )                                                                
                                } />
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold">Email:</Typography>
                                } />
                                <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                        <a href={`mailto:${ memberData.email }`} style={{ textDecoration: 'none', color: '#1e293b'}}>{ memberData.email }</a>
                                    </Typography>
                                } />
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold">Payment Emails:</Typography>
                                } />
                                <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                        { memberData.payment_email ? memberData.MemberTransactions[0].MemberPaymentInformation.value : '' }
                                    </Typography>
                                } />
                            </ListItem>
                        </List>
                        <List className="">
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Referrer:</Typography>
                                } />
                                <ListItemText className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={                                
                                    (memberData.MemberReferral && memberData.MemberReferral.Member) ? (
                                        <div className='flex items-center'>
                                            <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                                { memberData.MemberReferral.Member.referral_code }
                                            </Typography>
                                            <Link to={`/app/members/${memberData.MemberReferral.member_id}`} style={{ textDecoration: 'none', color: '#1e293b'}}>
                                                <IconButton color="primary" aria-label="Filter" component="span">
                                                    <FuseSvgIcon className="text-48" size={18} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                </IconButton>
                                            </Link>
                                        </div>
                                    ) : '--'                                                            
                                }/>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Level:</Typography>
                                } />
                                <ListItemText className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={
                                    editMode ? (
                                        <div>
                                            <TextField
                                                sx={{ ...selectStyle, ...textFieldStyle }}
                                                id="standard-select-currency-native"
                                                select
                                                value={ memberData.MembershipTier ?  memberData.MembershipTier.name : ''}
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                variant="standard"
                                                onChange={
                                                    (e)=>setMemberData({
                                                        ...memberData, 
                                                        'MembershipTier': {
                                                            name: e.target.value
                                                        },
                                                        'membership_tier_id': e.target.value
                                                    })
                                                }
                                                >
                                                <option value="">--Select--</option>
                                                <option value="1">Level 1</option>
                                                <option value="2">Level 2</option>
                                                <option value="3">Level 3</option>
                                                <option value="4">Level 4</option>
                                                <option value="5">Level 5</option>
                                            </TextField>
                                        </div>
                                    ) : (
                                        <Typography variant="body1" className="sm:text-sm md:text-lg lg:text-base xl:text-base">{ memberData.MembershipTier ? `Level ${memberData.MembershipTier.name}` : '' }</Typography>
                                    )
                                    
                                }/>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemText className="sm:w-1/5 lg:w-1/3 xl:w-1/5" primary={
                                    <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Phone:</Typography>
                                } />
                                <ListItemText className="sm:w-3/4 lg:w-2/3 xl:w-4/5" primary={
                                    editMode ? (
                                        <div className='flex lg:flex-col xl:flex-row justify-between'>
                                            <Autocomplete
                                                {...countryCodeProps}
                                                className="sm:w-3/4 xl:w-2/4 sm:mr-10 md:mr-0 md:w-2/4 lg:w-full"
                                                sx={{ '& .MuiAutocomplete-inputRoot': {minHeight: '30px'}, '& .MuiFormControl-fullWidth': {'@media screen and (max-width: 1400px)': {width:'100%'}}}}
                                                id="clear-on-escape"
                                                value={ countryData.filter(c => c.id == memberData.country_code)[0]}
                                                clearOnEscape
                                                onChange={ (e, newValue)=> setMemberData({...memberData, country_code: newValue.id}) }
                                                renderInput={(params) => (
                                                    <TextField {...params} variant="standard" sx={{...textFieldStyle }} />
                                                )}
                                            />
                                            <TextField
                                                type="tel"
                                                className="xl:w-2/5 md:w-2/5 lg:w-full"
                                                id="standard-helperText"
                                                defaultValue={ memberData.phone_no }
                                                variant="standard"
                                                sx={textFieldStyle}
                                                onKeyUp={ handlePhoneValidation }
                                            />
                                        </div>
                                    ) : (
                                        <Typography variant="body1" className="sm:text-sm md:text-lg lg:text-base xl:text-base">
                                            {
                                                memberData.country_code && `(${phoneCountryCode()}) ` + memberData.phone_no 
                                            }
                                        </Typography>
                                    )                    
                                } />
                            </ListItem>
                        </List>
                    </div>
                </div>
                <div className='flex xl:flex-col lg:flex-col sm:flex-row items-center justify-between'>
                    <Box
                        className="lg:mb-10 sm:mb-0 bg-gray-300 sm:w-2/3 lg:w-full"
                        sx={{
                            height: 'auto',                        
                            p: 1.8
                        }}
                    >
                        <Typography variant="body1" className="mb-10 font-medium">
                            Balance: ${ showBalance() } (Total Earnings)
                        </Typography>
                        <Typography variant="body1" className="mb-10 font-medium">
                            Adjustment: { memberData.total_earnings && memberData.total_earnings.total_adjustment ? '$'+ memberData.total_earnings.total_adjustment : 0}
                        </Typography>                    
                        <Adjustment updateMemberData={ updateMemberData }/>        
                    </Box>

                    <div className='sm:w-1/4 lg:w-full lg:text-left sm:text-center'>
                        <Typography variant="body1" className="mb-5">Login as this account</Typography>
                        <Button variant="outlined" size="small" color="error" onClick={ ()=>onOpenAlertDialogHandle('delete') } sx={{padding: '4px 15px'}}>DELETE ACCOUNT</Button>
                    </div>
                </div>
            </div>
            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3}} className="md:my-20 sm:my-20 sm:mx-10 lg:mx-16 xl:24 sm:hidden lg:flex" />
            <Divider orientation="horizontal" flexItem sx={{ borderWidth: 2}} className="md:my-36 sm:my-20 xl:24 lg:hidden" />
            <div className="lg:w-2/3 xl:w-3/5">
                <div className='flex flex-col'>
                    <div className='flex flex-row'>
                        <div className='w-1/2'> 
                            <div className='mb-16'>
                                <Typography 
                                    className="font-bold"
                                    variant="body1"                                    
                                >Additional Information</Typography>
                                <List>
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Geo Location:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={ 
                                            (memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].geo_location : '--'
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">IP:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={ 
                                            (memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].ip : '--'
                                        } />
                                    </ListItem>     
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Browser:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={ 
                                            (memberData.IpLogs && memberData.IpLogs.length) ? memberData.IpLogs[0].browser : '--'
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
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Address Line 1:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                            <>
                                            {
                                                editMode ? (
                                                    <TextField
                                                        type="text"
                                                        id="standard-helperText" 
                                                        defaultValue={ memberData.address_1 }                              
                                                        variant="standard"
                                                        sx={textFieldStyle}
                                                        onChange={
                                                            (e)=> setMemberData({...memberData, address_1: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_1 }</Typography>
                                                )
                                            }
                                            </>
                                        } />
                                    </ListItem>                                
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Address Line 2:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                            <>
                                            {
                                                editMode ? (
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue={ memberData.address_2 }                              
                                                        variant="standard"
                                                        sx={textFieldStyle}
                                                        onChange={
                                                            (e)=> setMemberData({...memberData, address_2: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_2 }</Typography>
                                                )
                                            }
                                            </>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Address Line 3:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                            <>
                                            {
                                                editMode ? (
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue={ memberData.address_3 }                              
                                                        variant="standard"
                                                        sx={textFieldStyle}
                                                        onChange={
                                                            (e)=> setMemberData({...memberData, address_3: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_3 }</Typography>
                                                )
                                            }
                                            </>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">ZIP Code:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                            <>
                                            {
                                                editMode ? (
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue={ memberData.zip_code }                              
                                                        variant="standard"
                                                        sx={textFieldStyle}
                                                        onChange={
                                                            (e)=> setMemberData({...memberData, zip_code: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.zip_code }</Typography>
                                                )
                                            }
                                            </>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                            <Typography variant="subtitle">Country:</Typography>
                                        } />
                                        <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                            <>
                                            {
                                                editMode ? (
                                                    <Autocomplete
                                                        {...countryProps}
                                                        value={ countryData.filter(c => c.id == memberData.country_id)[0]}
                                                        sx={{ '& .MuiAutocomplete-inputRoot': {minHeight: '30px'}}}
                                                        id="clear-on-escape"
                                                        onChange={
                                                            (e, newValue)=>setMemberData({...memberData, country_id: newValue.id})
                                                        }
                                                        clearOnEscape
                                                        renderInput={(params) => (
                                                            <TextField {...params} variant="standard" sx={{ width: '100%', ...textFieldStyle }} />
                                                        )}
                                                    />
                                                    
                                                ) : (
                                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                                        {memberData.country_id && countryData.filter(c => c.id == memberData.country_id)[0].name}
                                                    </Typography>
                                                )
                                            }
                                            </>
                                        } />
                                    </ListItem> 
                                </List>
                            </div>
                        </div>
                        <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3}} className="md:my-20 sm:my-20 sm:mx-10 lg:mx-16 xl:24 sm:hidden lg:flex" />

                        <div className='w-1/2'> 
                            <SurveyDetails surveyData={ surveyDetails } />
                        </div>
                    </div>
                    {/*<div className='flex flex-row'>
                        <div className='w-1/2 pr-10'>
                            <Typography 
                                variant="body1"
                                className="font-bold"
                                sx={{
                                    '@media screen and (max-width: 768px)': {
                                        fontSize: '1.5rem',
                                        fontWeight: '600'
                                    },
                                    '@media screen and (max-width: 1400px)': {
                                        fontSize: '1.8rem',
                                        fontWeight: '600'
                                    }
                                }}
                            >Address</Typography>
                            <List>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 1:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <TextField
                                                    type="text"
                                                    id="standard-helperText" 
                                                    defaultValue={ memberData.address_1 }                              
                                                    variant="standard"
                                                    sx={textFieldStyle}
                                                    onChange={
                                                        (e)=> setMemberData({...memberData, address_1: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_1 }</Typography>
                                            )
                                        }
                                        </>
                                    } />
                                </ListItem>                                
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 2:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <TextField
                                                    type="tel"
                                                    id="standard-helperText"                                
                                                    defaultValue={ memberData.address_2 }                              
                                                    variant="standard"
                                                    sx={textFieldStyle}
                                                    onChange={
                                                        (e)=> setMemberData({...memberData, address_2: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_2 }</Typography>
                                            )
                                        }
                                        </>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 3:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <TextField
                                                    type="tel"
                                                    id="standard-helperText"                                
                                                    defaultValue={ memberData.address_3 }                              
                                                    variant="standard"
                                                    sx={textFieldStyle}
                                                    onChange={
                                                        (e)=> setMemberData({...memberData, address_3: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.address_3 }</Typography>
                                            )
                                        }
                                        </>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                        <Typography variant="subtitle">ZIP Code:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <TextField
                                                    type="tel"
                                                    id="standard-helperText"                                
                                                    defaultValue={ memberData.zip_code }                              
                                                    variant="standard"
                                                    sx={textFieldStyle}
                                                    onChange={
                                                        (e)=> setMemberData({...memberData, zip_code: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.zip_code }</Typography>
                                            )
                                        }
                                        </>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-2/5 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Country:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-3/5 xl:w-2/3" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <Autocomplete
                                                    {...countryProps}
                                                    value={ countryData.filter(c => c.id == memberData.country_id)[0]}
                                                    sx={{ '& .MuiAutocomplete-inputRoot': {minHeight: '30px'}}}
                                                    id="clear-on-escape"
                                                    onChange={
                                                        (e, newValue)=>setMemberData({...memberData, country_id: newValue.id})
                                                    }
                                                    clearOnEscape
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="standard" sx={{ width: '100%', ...textFieldStyle }} />
                                                    )}
                                                />
                                                
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                                    {memberData.country_id && countryData.filter(c => c.id == memberData.country_id)[0].name}
                                                </Typography>
                                            )
                                        }
                                        </>
                                    } />
                                </ListItem> 
                            </List>
                        </div>
                         <div className='w-1/2'>
                            <List>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                                        <Typography variant="subtitle" className="font-semibold">Email:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                                        <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                            <a href={`mailto:${ memberData.email }`} style={{ textDecoration: 'none', color: '#1e293b'}}>{ memberData.email }</a>
                                        </Typography>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                                        <Typography variant="subtitle" className="font-semibold">Payment Emails:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                                        <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                            { memberData.payment_email ? memberData.MemberTransactions[0].MemberPaymentInformation.value : '' }
                                        </Typography>
                                    } />
                                </ListItem>                            
                            </List>
                        </div> 
                    </div>*/}
                    <Divider sx={{ borderWidth: 2}} className="my-10"/>
                    <Box component="div" className="w-full flex flex-col">
                        <Typography variant="body1" className="font-bold">Account Notes Section</Typography>
                        {
                            (accountNotes.length != 0) ? (
                                <AccountNotes accountNotes={ accountNotes } />
                            ) : (
                                <Typography variant="body1" className="italic text-grey-500">No records found!</Typography>
                            )
                        }                            
                    </Box>
                </div>
            </div>
            {
                openAlertDialog && (
                    <AlertDialog
                        content={ msg }
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
            {
                dialogStatus && (
                    <Dialog open={ dialogStatus } onClose={()=>setDialogStatus(false)} fullWidth={ true }>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogContent className="p-32 mt-10">                    
                            <TextareaAutosize
                                maxRows={8}
                                aria-label="maximum height"
                                placeholder="Add note"
                                defaultValue={ statusNote }
                                style={{ width: '100%', height: '100px' }}
                                className="border"
                                onChange={ (e)=>setStatusNote(e.target.value) }
                            />
                        </DialogContent>
                        <DialogActions className="px-32 py-20">
                            <Button className="mr-auto" variant="outlined" color="error" onClick={ handleCancelStatus }>Cancel</Button>
                            <Button variant="outlined" color="primary" onClick={ handleChangeStatus }>Skip</Button>
                            <Button color="primary" variant="contained" onClick={ handleChangeStatus } disabled={ statusNote ? false : true }>Save</Button>
                        </DialogActions>
                    </Dialog>
                )
            }
        </Box>
    )
}

export default MemberDetails;