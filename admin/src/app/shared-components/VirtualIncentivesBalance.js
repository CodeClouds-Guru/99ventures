import * as React from 'react';
import { Box, Divider } from '@mui/material';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    width: '60%',
    height: 'auto'
};

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 400 },
    { field: 'balance', headerName: 'Balance', width: 100 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'type', headerName: 'Type', width: 130 }    
];
  

const VirtualIncentivesBalance = (props) => {
    const [programs, setPrograms] = React.useState([])
    React.useEffect(()=>{
        const rows = props.programs.filter(row => row.name !== 'DO NOT USE').map(row => {
            return {
                ...row,
                id: row.programid
            }
        });
        setPrograms(rows);
    }, [props.programs])
        
    return (
        <Modal
            keepMounted
            open={props.status}
            onClose={ ()=>props.setVimodal(false) }
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography variant="h5">Virtual Incentives - Program List</Typography>
                <Divider className="my-10" />
                <div style={{ height: 500, width: '100%' }}>
                    {
                        (programs.length) ? (
                            <DataGrid
                                rows={programs}
                                columns={columns}
                                pageSize={20}
                                pageSizeOptions={[10, 20]}
                            />
                        ) : 'No Record found!'
                    }                    
                </div>
            </Box>
        </Modal>
    )
}

export default VirtualIncentivesBalance;