import { useState } from 'react';
import { Box, Avatar, Stack, Divider, IconButton, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Button, List, ListItem, ListItemIcon, ListItemText,  TextareaAutosize, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AlertDialog from 'app/shared-components/AlertDialog';
import { showMessage } from 'app/store/fuse/messageSlice';


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

const MemberDetails = () => {
    const [ editMode, setEditMode ] = useState(false);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);
    const [ alertType, setAlertType ] = useState('');
    const [ msg, setMsg ] = useState('');


    const onOpenAlertDialogHandle = () => {
        
        setOpenAlertDialog(true);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false);
    }
  
    const onConfirmAlertDialogHandle = async () => {        
        
        
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
                        ><strong>Username</strong> </Typography>
                        {
                            !editMode ? (
                                <Tooltip title="Click to edit" placement="top-start">
                                    <IconButton color="primary" aria-label="Filter" component="div" onClick={ ()=> setEditMode(true)}>
                                        (<FuseSvgIcon className="text-48" size={20} color="action">heroicons-outline:pencil-alt</FuseSvgIcon>)
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Click to save" placement="top-start">
                                    <IconButton color="primary" aria-label="Filter" component="div" onClick={ ()=> setEditMode(false)}>
                                        (<FuseSvgIcon className="text-48" size={20} color="action">feather:save</FuseSvgIcon>)
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    </div>
                    <div className='relative'>
                        <Avatar 
                            src="https://ui-avatars.com/api/?name=Sourabh+Das"
                            sx={{ 
                                width: 120, 
                                height: 120 ,
                                '@media screen and (max-width: 768px)': {
                                    width: 60, 
                                    height: 60,                                    
                                },
                                '@media screen and (max-width: 1300px)': {
                                    width: 80, 
                                    height: 80,                                    
                                }
                        }}>SD</Avatar>
                        {
                            editMode && (
                                <IconButton color="primary" aria-label="Filter" component="div" sx={{position: 'absolute', top: '80px', left: '70%'}}>
                                    <FuseSvgIcon className="text-48" size={22} color="light">heroicons-outline:camera</FuseSvgIcon>
                                </IconButton>
                            )
                        }
                    </div>
                </div>
                <List className="sm:mb-16 lg:mb-32">
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>ID:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <>
                            {
                                editMode ? (
                                    <TextField
                                        id="standard-helperText"                                
                                        defaultValue="Default Value"                                
                                        variant="standard"
                                    />
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">123456</Typography>
                                )
                            }
                            </>
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
                                    <TextField
                                        id="standard-helperText"                                
                                        defaultValue="Default Value"                                
                                        variant="standard"
                                    />
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">Member</Typography>
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
                                    <TextField
                                        id="standard-helperText"                                
                                        defaultValue="Default Value"                                
                                        variant="standard"
                                    />
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">XXXXXX XXXXXX</Typography>
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
                            <>
                            {
                                editMode ? (
                                    <TextField
                                        id="standard-helperText"                                
                                        defaultValue="Default Value"                                
                                        variant="standard"
                                    />
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">Example Refer ip</Typography>
                                )
                            }
                            </>   
                        }/>
                    </ListItem>                    
                    
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Level:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <>
                            {
                                editMode ? (
                                    <div >
                                        <TextField
                                            sx={{ minWidth: 220 }}
                                            id="standard-select-currency-native"
                                            select
                                            // label="Level"
                                            value=""              
                                            SelectProps={{
                                                native: true,
                                            }}
                                            variant="standard"
                                            >
                                            <option value="">--Select--</option>
                                            <option value="A">Level A</option>
                                        </TextField>
                                    </div>
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">Level 1</Typography>
                                )
                            }
                            </>
                        }/>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText className="sm:w-1/3 lg:w-1/3 xl:w-1/5" primary={
                            <Typography variant="subtitle" className="font-semibold" sx={labelStyling}>Phone:</Typography>
                        } />
                        <ListItemText className="sm:w-2/3 lg:w-2/3 xl:w-4/5" primary={
                            <>
                            {
                                editMode ? (
                                    <TextField
                                        type="tel"
                                        id="standard-helperText"                                
                                        defaultValue="Default Value"                                
                                        variant="standard"
                                    />
                                ) : (
                                    <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">+44 123 456 789</Typography>
                                )
                            }
                            </>                             
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
                    <Button variant="text" color="error" size="small">DELETE ACCOUNT</Button>
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
                                <ListItem disablePadding >
                                    <ListItemText className="w-full" primary={
                                        <>
                                        {
                                            editMode ? (
                                                <>
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue="Default Value"                                
                                                        variant="standard"
                                                    />
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue="Default Value"                                
                                                        variant="standard"
                                                    />
                                                    <TextField
                                                        type="tel"
                                                        id="standard-helperText"                                
                                                        defaultValue="Default Value"                                
                                                        variant="standard"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Typography variant="subtitle">1st Line</Typography><br/>
                                                    <Typography variant="subtitle">2nd Line</Typography><br/>
                                                    <Typography variant="subtitle">3rd Line</Typography>
                                                </>
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
                                                    defaultValue="Default Value"                                
                                                    variant="standard"
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">12345</Typography>
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
                                                <TextField
                                                    type="tel"
                                                    id="standard-helperText"                                
                                                    defaultValue="Default Value"                                
                                                    variant="standard"
                                                />
                                            ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">XXXX</Typography>
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
                                        <>
                                        {
                                            // editMode ? (
                                            //     <TextField
                                            //         type="tel"
                                            //         id="standard-helperText"                                
                                            //         defaultValue="Default Value"                                
                                            //         variant="standard"
                                            //     />
                                            // ) : (
                                                <Typography variant="body1" className="sm:text-sm lg:text-base xl:text-base">someone@gmail.com</Typography>
                                            // )
                                        }
                                        </> 
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
            <AlertDialog
                content="hello"
                open={openAlertDialog}
                onConfirm={onConfirmAlertDialogHandle}
                onClose={onCloseAlertDialogHandle}
            />
        </Box>
    )
}

export default MemberDetails;