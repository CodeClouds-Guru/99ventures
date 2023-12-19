
import axios from 'axios'
import moment from "moment";
import * as React from 'react';
import { useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FusePageSimple from '@fuse/core/FusePageSimple';
import MainHeader from 'app/shared-components/MainHeader';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { IconButton, Typography, Tooltip, List, ListItem, ListItemText, Paper, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material'

const chipStyle = {
    height: '25px',
    fontSize: '1.2rem',
    '& .muiltr-6od3lo-MuiChip-label': {
        paddingLeft: '10px',
        paddingRight: '10px'
    }
}

function RedemptionReport() {
    const { moduleId } = useParams();
    const [promocodeDetails, setPromocodeDetails] = React.useState([]);

    const redeemData = () => {
        axios.get(jwtServiceConfig.promocode + '/view/' + moduleId)
            .then(res => {
                setPromocodeDetails(res.data.results.result);
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }

    React.useEffect(()=>{
        redeemData()
    }, []);


    return (    
        <FusePageSimple
        header={
            <MainHeader module="Redemption Report" backUrl="/app/promo-codes" />
        }
        content={
        <>  
            <div className='p-10 w-full'>
                <div className='flex justify-between'>
                    <Card className="mb-10" style={{width: '49%'}}>
                        <CardContent>
                            <nav aria-label="main mailbox folders">
                                <List>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex items-center'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Promo Code:</Typography>
                                                <Typography variant="subtitle1">{promocodeDetails.code}</Typography>
                                                <Tooltip title="Open in new window" placement="top-start" >
                                                    <IconButton color="primary" aria-label="External Link" component="span" onClick={()=>{window.open(`/app/promo-codes/${promocodeDetails.id}`, '_blank')}}>
                                                        <FuseSvgIcon className="text-48" size={18} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Amount:</Typography>
                                                <Typography variant="subtitle1">{promocodeDetails.cash}</Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Point:</Typography>
                                                <Typography variant="subtitle1">{promocodeDetails.point}</Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                </List>
                            </nav>
                        </CardContent>
                    </Card> 
                    <Card className="mb-10" style={{width: '49%'}}>
                        <CardContent>
                            <nav aria-label="main mailbox folders">
                                <List>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Uses:</Typography>
                                                <Typography variant="subtitle1">{promocodeDetails.max_uses}</Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Total Used:</Typography>
                                                <Typography variant="subtitle1">{promocodeDetails.used ?? 0}</Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Status:</Typography>
                                                <Typography variant="subtitle1">
                                                    <Chip label={promocodeDetails.status} color={(promocodeDetails.status === 'active') ? "success" : "error"} sx={chipStyle}/>
                                                </Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                </List>
                            </nav>
                        </CardContent>
                    </Card>    
                </div>            
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead className="bg-gray-100">
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell align="left">Username</TableCell>
                                <TableCell align="left">First Name</TableCell>
                                <TableCell align="left">Last Name</TableCell>
                                <TableCell align="left">Redeemed At</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {
                            (promocodeDetails.MemberPromoCode && promocodeDetails.MemberPromoCode.length) ? promocodeDetails.MemberPromoCode.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.id}
                                    </TableCell>
                                    <TableCell align="left">
                                        <div className='flex items-center'>
                                            {row.username}
                                            <Tooltip title="Open in new window" placement="top-start" >
                                                <IconButton color="primary" aria-label="External Link" component="span" onClick={()=>{window.open(`/app/members/${row.id}`, '_blank')}}>
                                                    <FuseSvgIcon className="text-48" size={14} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    <TableCell align="left">{row.first_name}</TableCell>
                                    <TableCell align="left">{row.last_name}</TableCell>
                                    <TableCell align="left">{ moment(row.MemberTransactions[0].created_at).format('Do MMM YYYY, HH:mm')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="td" scope="row" colSpan="4" align="center">
                                        <p className='text-gray-500'>No Records Found!</p>
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        </TableBody>
                    </Table>
                </TableContainer>
                    
            </div>
        </>
        }
        scroll="page"
        />
    );
}


export default RedemptionReport;