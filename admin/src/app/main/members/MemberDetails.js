import { useState, useEffect } from 'react';
import { Box, Avatar, Stack, Divider, IconButton, Typography, TextField, Link, Autocomplete, Chip, Select, MenuItem, InputLabel, FormControl, Button, List, ListItem, ListItemIcon, ListItemText,  TextareaAutosize, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import axios from 'axios'
import CountryData from 'src/app/CountryData';
import { useDispatch } from 'react-redux'

const buttonStyle = {
    borderRadius: '5px', 
    paddingLeft: 6, 
    paddingRight: 6,
    '@media screen and (max-width: 768px)': {
        fontSize: '1rem',
        width: '70px',
    },
    '@media screen and (max-width: 1300px)': {
        width: '100px',
        paddingLeft: '25px', 
        paddingRight: '25px',
        
    }
}

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

const MemberDetails = () => {
    const dispatch = useDispatch();
    const { moduleId } = useParams();
    const [ editMode, setEditMode ] = useState(false);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ alertType, setAlertType ] = useState('');
    const [ msg, setMsg ] = useState('');
    const [ memberData, setMemberData ] = useState({});
    const [ countryData, setCountryData ] = useState([]);

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
        }
    }

    /**
     * Get Member Details
     */
     const getMemberData = () => {
        axios.post(jwtServiceConfig.getSingleMember + '/' + moduleId)
            .then(res => {
                if (res.data.results.data) {
                    setMemberData(res.data.results.data);
                    setCountryData(res.data.results.data.country_list);
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
        const params = {
            "type": "basic_details",
            "data": {
                "first_name": memberData.first_name,
                "last_name": memberData.last_name,
                "country_code": memberData.country_code,
                "status": memberData.status,
                "zip_code": memberData.zip_code,
                "phone_no": memberData.phone_no,
                "address_1": memberData.address_1,
                "address_2": memberData.address_2,
                "address_3": memberData.address_3,
                "country_id": memberData.country_id,
                "membership_tier_id": memberData.membership_tier_id
            }
        }

        axios.post(jwtServiceConfig.memberUpdate + '/' + moduleId, params)
        .then(res => {
            onCloseAlertDialogHandle()
            if (res.data.results.message) {
                dispatch(showMessage({ variant: 'success', message: res.data.results.message }));
                setEditMode(false);
            }
        })
        .catch(errors => {
            console.log(errors);
            dispatch(showMessage({ variant: 'error', message: error.response.data.errors }));
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
        if(status === 'verified') 
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

        setMemberData({...memberData, avatar: response})
    }

    return (
        <Box className="sm:p-16 lg:p-24 xl:p-32 flex sm:flex-col lg:flex-row" >
            <div className="lg:w-1/3 xl:w-2/5">
                <div className='flex justify-between xitems-center'>
                    <div className='flex justify-between items-center'>
                        <Typography 
                            variant="h4"
                            sx={{
                                marginRight: '10px',
                                '@media screen and (max-width: 768px)': {
                                    fontSize: '2rem'
                                },
                                '@media screen and (max-width: 1300px)': {
                                    fontSize: '2.5rem'
                                }
                            }}
                        ><strong>{memberData.username}</strong> </Typography>
                        {
                            !editMode ? (
                                <Tooltip title="Click to edit" placement="top-start">
                                    <IconButton color="primary" aria-label="Filter" component="div" onClick={ ()=> setEditMode(true)}>
                                        (<FuseSvgIcon className="text-48" size={20} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>)
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <div>
                                    <Tooltip title="Click to save" placement="top-start">
                                        <IconButton color="primary" aria-label="Filter" component="div" onClick={ ()=>onOpenAlertDialogHandle('save_profile') }>
                                            (<FuseSvgIcon className="text-48" size={20} color="action">feather:save</FuseSvgIcon>)
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Click to cancel" placement="top-start">
                                        <IconButton color="primary" aria-label="Filter" component="div" onClick={ ()=> setEditMode(false)}>
                                            (<FuseSvgIcon className="text-48" size={20} color="action">material-outline:cancel</FuseSvgIcon>)
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            )
                        }
                    </div>
                    <div className='relative'>
                        
                    <Box
                    sx={{
                        borderWidth: 4,
                        borderStyle: 'solid',
                        borderColor: 'background.paper',
                    }}
                    className="relative flex items-center justify-center w-128 h-128 rounded-full overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div>
                                <label htmlFor="button-avatar" className="flex p-8 cursor-pointer">
                                    <input
                                    accept="image/*"
                                    className="hidden"
                                    id="button-avatar"
                                    type="file"
                                    onChange={(e) => {                                        
                                        readFileAsync(e);
                                    }}
                                    />
                                    <FuseSvgIcon className="text-white">heroicons-outline:camera</FuseSvgIcon>
                                </label>
                            </div>
                        <div>
                        <IconButton
                            onClick={() => {
                                onChange('');
                            }}
                        >
                            <FuseSvgIcon className="text-white">heroicons-solid:trash</FuseSvgIcon>
                        </IconButton>
                        </div>
                    </div>
                    <Avatar
                        sx={{
                        backgroundColor: 'background.default',
                        color: 'text.secondary',
                        }}
                        className="object-cover w-full h-full text-64 font-bold"
                        src={ memberData.avatar }
                        alt=""
                    >
                        SD
                    </Avatar>
                    </Box>

                        {/* <Avatar 
                            src={memberData.avatar ? memberData.avatar :  `https://ui-avatars.com/api/?name=${ memberData.first_name}+${ memberData.last_name}`}
                            sx={{ 
                                width: 120, 
                                height: 120 ,
                                '@media screen and (max-width: 768px)': {
                                    width: 60, 
                                    height: 60,                                    
                                },
                                '@media screen and (max-width: 1300px)': {
                                    width: 120,
                                    height: 120,                                    
                                }
                        }}></Avatar>
                        {
                            editMode && (
                                <IconButton 
                                    color="primary" 
                                    aria-label="Filter" 
                                    component="div" 
                                    sx={{
                                        position: 'absolute', 
                                        top: '80px', 
                                        left: '70%',
                                        '@media screen and (max-width: 1300px)': {

                                        }
                                    }}
                                    >
                                    <FuseSvgIcon className="text-48" size={22} color="primary">heroicons-outline:camera</FuseSvgIcon>
                                </IconButton>
                            )
                        }  */}
                    </div>
                </div>
                <List className="sm:mb-16 lg:mb-32">
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
                                editMode ? (
                                    <div >
                                        <TextField
                                            sx={{ minWidth: 220, ...textFieldStyle }}
                                            id="standard-select-currency-native"
                                            select
                                            value={ memberData.status }             
                                            SelectProps={{
                                                native: true,
                                            }}
                                            onChange={
                                                (e)=> setMemberData({...memberData, status: e.target.value})
                                            }
                                            variant="standard"
                                            >
                                            <option value="">--Select--</option>
                                            <option value="verified">Verified</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="validating">Validating</option>
                                            <option value="deleted">Deleted</option>
                                        </TextField>
                                    </div>
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ showStatus(memberData.status) }</Typography>
                                )
                            }
                            </>
                        } />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Name:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
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
                                            className="mr-10"
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

                <List className="sm:mb-16 lg:mb-32">
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
                                        sx={{ minWidth: 220, ...textFieldStyle }}
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
                                <div className='flex'>
                                    <Autocomplete
                                        {...countryCodeProps}
                                        className="mr-10"
                                        sx={{ '& .MuiAutocomplete-inputRoot': {minHeight: '30px'}}}
                                        id="clear-on-escape"
                                        value={ countryData.filter(c => c.phonecode == memberData.country_code)[0]}
                                        clearOnEscape
                                        onChange={ (e, newValue)=> setMemberData({...memberData, country_code: newValue.phonecode}) }
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
                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">{ `(${memberData.country_code}) ` + memberData.phone_no }</Typography>
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
            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3}} className="md:my-36 sm:my-20 sm:mx-10 lg:mx-20 xl:24" />
            <div className="lg:w-2/3 xl:w-3/5">
                <Stack spacing={{sm:1, lg:2}} direction="row" className="justify-between mb-24">
                    <Button variant="contained" size="large" sx={buttonStyle}>Profile</Button>
                    <Button variant="contained" size="large" sx={buttonStyle}>History</Button>
                    <Button variant="contained" size="large" sx={buttonStyle}>Downtime</Button>
                    <Button variant="contained" size="large" sx={buttonStyle}>IP Log</Button>
                    <Button variant="contained" size="large" sx={buttonStyle}>Withdraws</Button>
                </Stack>
                <div className='flex flex-col'>
                    <div className='flex flex-row'>
                        <div className='w-1/2'> 
                            <div className='mb-96'>
                                <Typography 
                                    variant="h6"
                                    sx={{
                                        '@media screen and (max-width: 768px)': {
                                            fontSize: '1.5rem',
                                            fontWeight: '600'
                                        },
                                        '@media screen and (max-width: 1300px)': {
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
                                        <ListItemText className="w-3/5" primary="Kolkata, West bengal" />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText className="w-2/5" primary={
                                            <Typography variant="subtitle">IP:</Typography>
                                        } />
                                        <ListItemText className="w-3/5" primary="192.168.1.1" />
                                    </ListItem>                            
                                </List>
                            </div>
                        </div>
                        <div className='w-1/2'> 
                            <Box
                                className="mb-32 text-center"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    backgroundColor: '#777777',
                                    p: 6
                                }}
                            >
                                <Typography variant="body1" className="text-white">Previous 5 Completions</Typography>
                                <Typography variant="body1" className="text-white">(Name, Date, Amount)</Typography>
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
                                    '@media screen and (max-width: 1300px)': {
                                        fontSize: '1.8rem',
                                        fontWeight: '600'
                                    }
                                }}
                            >Address</Typography>
                            <List>
                                <ListItem disablePadding>
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 1:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-2/3" primary={
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
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 2:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-2/3" primary={
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
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Address Line 3:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-2/3" primary={
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
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/3" primary={
                                        <Typography variant="subtitle">ZIP Code:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-2/3" primary={
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
                                    <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/3" primary={
                                        <Typography variant="subtitle">Country:</Typography>
                                    } />
                                    <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-2/3" primary={
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
                                    <ListItemText className="w-2/5" primary={
                                        <Typography variant="subtitle" className="font-semibold">Payment Details:</Typography>
                                    } />
                                    <ListItemText className="w-3/5" primary="" />
                                </ListItem>                            
                            </List>
                        </div>
                    </div>
                    <Box component="div" sx={{ p: 2, border: '1px dashed grey', height: 200 }} className="mt-24 flex justify-center items-center">
                        <Typography variant="body1">Account notes section</Typography>
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
            
        </Box>
    )
}

export default MemberDetails;