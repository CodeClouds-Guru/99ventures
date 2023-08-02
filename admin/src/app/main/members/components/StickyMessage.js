import { Typography} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const StickyMessage = () => {
    return (
        <div className='stick--msg flex justify-center items-center'>                    
            <FuseSvgIcon className="text-48 text-white" size={20} color="action">material-outline:sentiment_dissatisfied</FuseSvgIcon>
            <Typography variant="body2" className="font-bold ml-5">
                Member Deleted
            </Typography>
        </div>
    )
}

export default StickyMessage;