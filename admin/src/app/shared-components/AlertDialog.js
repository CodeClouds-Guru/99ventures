import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog(props) {
    const [disabledBtn, setDisabledBtn] = useState(false);
    let open = props.open;
    const handleClose = () => {
        props.onClose();
        setDisabledBtn(false);
    };
    const handleConfirmation = () => {
        props.onConfirm();
        setDisabledBtn(true);
    }

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {props.title ?? 'Alert'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.content ?? 'Are you sure you want to perform this action?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleConfirmation} autoFocus disabled={disabledBtn}>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
