import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { useState, useEffect, useRef} from 'react';
import { Box, Avatar, Stack, Divider, IconButton, Typography, TextField, Link, Autocomplete, Chip, Dialog, DialogTitle, DialogActions, DialogContent, Button, List, ListItem, ListItemIcon, ListItemText,  TextareaAutosize, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import AccountNotes from './components/AccountNotes';
import MemberTxn from './components/MemberTxn';
import { useDispatch } from 'react-redux';
import Helper from 'src/app/helper';
import axios from 'axios'

/*const buttonStyle = {
    borderRadius: '5px', 
    paddingLeft: 6, 
    paddingRight: 6,
    '@media screen and (max-width: 768px)': {
        fontSize: '1rem',
        width: '70px',
    },
    '@media screen and (max-width: 1400px)': {
        width: '105px',
        paddingLeft: '18px', 
        paddingRight: '18px',
        fontSize: '1.2rem'
        
    },
    '@media screen and (max-width: 1700px)': {
        width: '130px',
        paddingLeft: '22px', 
        paddingRight: '22px',
        fontSize: '1.3rem'
        
    }
}*/

const labelStyling = {
    '@media screen and (max-width: 768px)': {
        fontSize: '1.4rem'
    }
} 

const textFieldStyle = {
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
    minWidth: '220px',
    '@media screen and (max-width: 1400px)': {
        minWidth: '100%'
    }
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

    const onOpenAlertDialogHandle = (type) => {
        var msg = '';
        if(type === 'delete')
            msg = 'Do you want to delete your account?';
        else if(type === 'save_profile')
            msg = 'Do you want to save changes?';
        
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
     const getMemberData = () => {
        axios.post(jwtServiceConfig.getSingleMember + '/' + moduleId)
            .then(res => {
                if (res.data.results.data) {
                    const result = res.data.results.data;
                    // const avatarUrl = (result.avatar) ? result.avatar : `https://ui-avatars.com/api/?name=${ result.first_name}+${ result.last_name}`;
                    const avatarUrl = `https://ui-avatars.com/api/?name=${ result.first_name}+${ result.last_name}`;
                    setCountryData(result.country_list);
                    setAccountNotes(result.MemberNotes);
                    setStatus(result.status); 
                    setAvatar(avatarUrl);
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
    }, []);

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
                getMemberData();
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

    return (
        <Box className="sm:p-16 lg:p-22 md:p-16 xl:p-32 flex sm:flex-col lg:flex-row" >
            <div className="lg:w-1/3 xl:w-2/5">
                <div className='flex justify-between xitems-center flex-col'>
                    <div className='flex xjustify-between items-center flex-wrap mb-24'>
                        <Typography 
                            variant="h4"
                            sx={{
                                marginRight: '10px',
                                '@media screen and (max-width: 768px)': {
                                    fontSize: '1.5rem'
                                },
                                '@media screen and (max-width: 1400px)': {
                                    fontSize: '2rem'
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
                    <div className='relative m-auto'>
                        <Box
                            sx={{
                                borderWidth: 4,
                                borderStyle: 'solid',
                                borderColor: 'background.paper',
                                width: '14rem',
                                height: '14rem',  
                                '@media screen and (max-width: 1400px)': {
                                    width: '10rem',
                                    height: '10rem',
                                },
                                '@media screen and (max-width: 768px)': {
                                    width: '15rem',
                                    height: '15rem',
                                }
                            }}
                            className="shadow-md relative flex items-center justify-center rounded-full overflow-hidden"
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
                </div>
                <List className="sm:mb-16 lg:mb-20">
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>ID:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.id }</Typography>
                        }/>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Status:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={ 
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
                                            <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ showStatus(memberData.status) }</Typography>
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
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Name:</Typography>
                        } />
                        <ListItemText sx={listItemTextStyle} className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <>
                            {
                                editMode ? (
                                    <>
                                        <TextField
                                            id="standard-helperText"                                
                                            defaultValue={memberData.first_name}                               
                                            variant="standard"
                                            placeholder="First Name"
                                            sx={textFieldStyle}
                                            className="left-textbox"
                                            onChange={
                                                (e)=> setMemberData({...memberData, first_name: e.target.value})
                                            }
                                        />
                                        <TextField
                                            id="standard-helperText"                                
                                            defaultValue={memberData.last_name}                                
                                            variant="standard"
                                            placeholder="Last Name"
                                            sx={textFieldStyle}
                                            onChange={
                                                (e)=> setMemberData({...memberData, last_name: e.target.value})
                                            }
                                        />
                                    </>
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.first_name +' '+ memberData.last_name }</Typography>
                                )
                            }
                            </>                            
                        } />
                    </ListItem>
                </List>

                <List className="sm:mb-16 lg:mb-20">
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Referrer:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.referer }</Typography>
                        }/>
                    </ListItem>                    
                    
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Level:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            editMode ? (
                                <div >
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
                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ memberData.MembershipTier ? `Level ${memberData.MembershipTier.name}` : '' }</Typography>
                            )
                            
                        }/>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Phone:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            editMode ? (
                                <div 
                                    className='flex lg:flex-col xl:flex-row justify-between'
                                >
                                    <Autocomplete
                                        {...countryCodeProps}
                                        className="xmr-10"
                                        sx={{ '& .MuiAutocomplete-inputRoot': {minHeight: '30px'}, '& .MuiFormControl-fullWidth': {'@media screen and (max-width: 1400px)': {width:'100%'}}}}
                                        id="clear-on-escape"
                                        value={ countryData.filter(c => c.id == memberData.country_code)[0]}
                                        clearOnEscape
                                        onChange={ (e, newValue)=> setMemberData({...memberData, country_code: newValue.id}) }
                                        renderInput={(params) => (
                                            <TextField {...params} variant="standard" sx={{ width: 220, ...textFieldStyle }} />
                                        )}
                                    />
                                    <TextField
                                        type="tel"
                                        id="standard-helperText"
                                        defaultValue={ memberData.phone_no }
                                        variant="standard"
                                        sx={textFieldStyle}
                                        onKeyUp={ handlePhoneValidation }
                                    />
                                </div>
                            ) : (
                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                    {
                                        memberData.country_code && `(${countryData.filter(c => c.id == memberData.country_code)[0].phonecode}) ` + memberData.phone_no 
                                    }
                                </Typography>
                            )                    
                        } />
                    </ListItem>
                </List>

                <Box
                    className="mb-32"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        backgroundColor: '#777777',
                        p: 3
                        // '&:hover': {
                        //     backgroundColor: 'primary.main',
                        //     opacity: [0.9, 0.8, 0.7],
                        // },
                    }}
                >
                    <Typography variant="body1" className="mb-24 text-white">Balance: $1234.00 (Total Earnings)</Typography>
                    <div>
                        <Typography variant="body1" className="text-white">Adjustment: $0000.00</Typography>
                        <Typography variant="body1" className="text-white">Description: ffff</Typography>
                        <Typography variant="body1" className="text-white">- 123.46 +</Typography>
                    </div>                    
                </Box>

                <div>
                    <Typography variant="body1">Login as this account</Typography>
                    <Button variant="text" color="error" onClick={ ()=>onOpenAlertDialogHandle('delete') } sx={{padding: '8px 15px'}}>DELETE ACCOUNT</Button>
                </div>
            </div>
            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3}} className="md:my-36 sm:my-20 sm:mx-10 lg:mx-16 xl:24" />
            <div className="lg:w-2/3 xl:w-3/5">
                {/* <Stack spacing={{sm:1, lg:2}} direction="row" className="justify-between mb-24">
                    <Button variant="outlined" size="large" sx={buttonStyle}>Profile</Button>
                    <Button variant="contained" size="large" sx={buttonStyle} onClick={()=>navigate('/app/members/'+moduleId+'/history')}>History</Button>
                    <Button variant="contained" size="large" sx={buttonStyle} onClick={()=>navigate('/app/members/'+moduleId+'/downline')}>Downline</Button>
                    <Button variant="contained" size="large" sx={buttonStyle} onClick={()=>navigate('/app/members/'+moduleId+'/iplogs')}>IP Log</Button>
                    <Button variant="contained" size="large" sx={buttonStyle} onClick={()=>navigate('/app/members/'+moduleId+'/withdraws')}>Withdraws</Button>
                </Stack> */}
                <div className='flex flex-col'>
                    <div className='flex flex-row'>
                        <div className='w-1/2'> 
                            <div className='mb-92'>
                                <Typography 
                                    variant="h6"
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
                                >Additional Information</Typography>
                                <List>
                                    <ListItem disablePadding>
                                        <ListItemText className="w-2/5" primary={
                                            <Typography variant="subtitle">Geo Location:</Typography>
                                        } />
                                        <ListItemText className="w-3/5" primary={ memberData.IpLogs && memberData.IpLogs.length && memberData.IpLogs[0].geo_location } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="w-2/5" primary={
                                            <Typography variant="subtitle">IP:</Typography>
                                        } />
                                        <ListItemText className="w-3/5" primary={ memberData.IpLogs && memberData.IpLogs.length && memberData.IpLogs[0].ip } />
                                    </ListItem>                            
                                </List>
                            </div>
                        </div>
                        <div className='w-1/2'> 
                            <Box
                                className="text-left"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    border: '2px solid #eee',
                                    p: 1
                                }}
                            >
                                <Typography variant="body1 font-bold" >Previous 5 Completions</Typography>
                                <MemberTxn />
                            </Box>
                        </div>
                    </div>
                    <div className='flex flex-row'>
                        <div className='w-1/2'>
                            <Typography 
                                variant="h6"
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
                                                        <TextField {...params} variant="standard" sx={{ width: 220, ...textFieldStyle }} />
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
                                            <Link href={`mailto:${ memberData.email }`} style={{ textDecoration: 'none', color: '#1e293b'}}>{ memberData.email }</Link>
                                        </Typography>
                                    } />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                                        <Typography variant="subtitle" className="font-semibold">Payment Emails:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                                        <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">
                                            { memberData.payment_email ? memberData.payment_email.MemberPaymentInformation.value : '' }
                                        </Typography>
                                    } />
                                </ListItem>                            
                            </List>
                        </div>
                    </div>
                    <Divider sx={{ borderWidth: 2}}/>
                    <Box component="div" sx={{ p: 2 }} className="w-full flex flex-col px-0">
                        <Typography variant="h6" >Account Notes Section</Typography>
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