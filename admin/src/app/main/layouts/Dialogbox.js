import { DialogActions, Dialog, DialogContent, DialogTitle, Divider} from '@mui/material';

const DialogBox = (props) => {
    return (
        <Dialog maxWidth="md" fullScreen={ props.fullScreen } fullWidth={true} open={ props.popupStatus } onClose={ props.handleClose }>
            <DialogTitle>{ props.title }</DialogTitle>
            <Divider/>
            <DialogContent>
                { props.content }
            </DialogContent>
            <DialogActions className="justify-between px-24">
                { props.action }
            </DialogActions>
        </Dialog>
    )
}

export default DialogBox;