
import axios from 'axios'
import * as React from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FusePageSimple from '@fuse/core/FusePageSimple';
import MainHeader from 'app/shared-components/MainHeader';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig.js';
import { IconButton, Typography, Tooltip, List, ListItem, ListItemText, Paper, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material'
import FuseLoading from '@fuse/core/FuseLoading';


function Report() {
    const { moduleId } = useParams();
    const [details, setDetails] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const getReport = () => {
        axios.get(jwtServiceConfig.newsView + '/' + moduleId)
            .then(res => {
                setDetails(res.data.results.result);
                setLoading(false)
            })
            .catch(errors => {
                console.log(errors);
                dispatch(showMessage({ variant: 'error', message: errors.response.data.errors }));
            });
    }

    React.useEffect(()=>{
        getReport()
    }, []);

    if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<FuseLoading />
			</div>
		);
	}

    return (    
        <FusePageSimple
        header={
            <MainHeader module="Report" backUrl="/app/news" />
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
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Subject:</Typography>
                                                <Typography variant="subtitle1">{details.subject}</Typography>
                                                <Tooltip title="Open in new window" placement="top-start" >
                                                    <IconButton color="primary" aria-label="External Link" component="span" onClick={()=>{window.open(`/app/news/${details.id}`, '_blank')}}>
                                                        <FuseSvgIcon className="text-48" size={18} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Total Like(s):</Typography>
                                                <Typography variant="subtitle1">{details.NewsReactions?.length}</Typography>
                                            </div>
                                        } />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemText primary={
                                            <div className='flex'>
                                                <Typography variant="subtitle1" className="mr-10 font-semibold">Published At:</Typography>
                                                <Typography variant="subtitle1">{moment(details.published_at).format('DD-MMM-YYYY')}</Typography>
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {
                            (details.NewsReactions && details.NewsReactions.length) ? details.NewsReactions.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="td" scope="row" width={100}>
                                        {row.id}
                                    </TableCell>
                                    <TableCell align="left">
                                        <div className='flex items-center'>
                                            {row.Member.username}
                                            <Tooltip title="Open in new window" placement="top-start" >
                                                <IconButton color="primary" aria-label="External Link" component="span" onClick={()=>{window.open(`/app/members/${row.id}`, '_blank')}}>
                                                    <FuseSvgIcon className="text-48" size={14} color="action">heroicons-outline:external-link</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
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


export default Report;