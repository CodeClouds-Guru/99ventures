import { Box, TextField, Dialog, Divider, DialogTitle, DialogActions, DialogContent, Button, TextareaAutosize, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import AlertDialog from 'app/shared-components/AlertDialog';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';

const btnStyle = {
    borderRadius: '5px',
    fontSize: '2.3rem'
}

const Adjustment = (props) => {
    const [ dialogStatus, setDialogStatus ] = useState(false);
    const [ note, setNote ] = useState('');
    const [ adjustmentAmount, setAdjustmentAmount ] = useState(1);
    const [ openAlertDialog, setOpenAlertDialog ] = useState(false);

    const handleChangeStatus = () => {
        const params = {
            admin_amount: adjustmentAmount,
            admin_note: note,
            type: 'admin_adjustment'
        }
        props.updateMemberData(params, "adjustment");
        handleCancelStatus();
        onCloseAlertDialogHandle();
    }

    const handleCancelStatus = () => {
        setDialogStatus(false);
        setNote('');
        setAdjustmentAmount(1);
    }

    const onCloseAlertDialogHandle = () => {
        setOpenAlertDialog(false)
    }
  
    const onConfirmAlertDialogHandle = () => {
        handleChangeStatus()
    }

    return (
        <div className='flex items-center'>
            <Button variant="contained" color="primary" size="small" onClick={()=>setDialogStatus(true)}>Adjustment</Button>            
            {
                dialogStatus && (
                    <Dialog open={ dialogStatus } onClose={()=>setDialogStatus(false)} fullWidth={ true }>
                        <DialogTitle>Adjustment Note</DialogTitle>
                        <Divider />
                        <DialogContent className="p-32  flex flex-col justify-center">   
                            <div className='flex items-center my-20 mr-auto ml-auto'>                                
                                <Button variant="contained" color="primary" size="small" sx={btnStyle} onClick={()=>setAdjustmentAmount(adjustmentAmount => adjustmentAmount - 1)}>
                                    -
                                </Button>
                                
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-amount"
                                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                        label="Amount"
                                        type="number"
                                        value={ adjustmentAmount }
                                        onChange={(e)=> setAdjustmentAmount(e.target.value)}
                                    />
                                </FormControl>
                                
                                {/* <TextField type="number" value={ adjustmentAmount } id="outlined-basic" label="Amount" variant="outlined" sx={{  margin: '0 10px'}} onChange={(e)=> setAdjustmentAmount(e.target.value)} /> */}
                                <Button variant="contained" color="primary" size="small" sx={btnStyle} onClick={()=>setAdjustmentAmount(adjustmentAmount => +adjustmentAmount + 1)}>
                                    +
                                </Button>
                            </div>           
                            <TextField className="w-full" id="outlined-basic" label="Add Note" variant="outlined" onChange={ (e)=>setNote(e.target.value) }/>      
                            
                        </DialogContent>
                        <DialogActions className="px-32 py-20">
                            <Button className="mr-auto" variant="outlined" color="error" onClick={ handleCancelStatus }>Cancel</Button>
                            {/* <Button variant="outlined" color="primary" onClick={ handleChangeStatus }>Skip & Save</Button> */}
                            <Button color="primary" variant="contained" onClick={ ()=>setOpenAlertDialog(true) } disabled={ note ? false : true }>Save</Button>
                        </DialogActions>
                    </Dialog>
                )
            }
            {
                openAlertDialog && (
                    <AlertDialog
                        content="Do you want to update adjustment!"
                        open={openAlertDialog}
                        onConfirm={onConfirmAlertDialogHandle}
                        onClose={onCloseAlertDialogHandle}
                    />
                )
            }
            
        </div>
    )
}

export default Adjustment;