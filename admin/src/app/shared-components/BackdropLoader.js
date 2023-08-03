import { Typography, CircularProgress, Backdrop } from '@mui/material';

const BackdropLoader = () => {
    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
        >
            <div className='flex flex-col justify-center items-center'>
                <CircularProgress color="inherit" />
                <Typography variant="caption" component="p">Please wait...</Typography>
            </div>            
        </Backdrop>
    )
}

export default BackdropLoader;