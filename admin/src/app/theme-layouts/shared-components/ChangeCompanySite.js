import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import jwtService from '../../auth/services/jwtService';

const ChangeCompanySite = (props) => {
    const navigate = useNavigate();
    const backToCompanySite = () => {
        jwtService.setCompanySiteId(null, null);
        navigate('/company-site');
    }

    return (
        <>
            <Tooltip title="Change Company or Site" placement="bottom">
                <IconButton
                    className={clsx('w-40 h-40', props.className)}
                    aria-controls="font-size-menu"
                    aria-haspopup="true"
                    onClick={() => {
                        backToCompanySite();
                    }}
                    size="large"
                >
                    <FuseSvgIcon>heroicons-outline:refresh</FuseSvgIcon>

                </IconButton>
            </Tooltip>
        </>
    )
}

export default ChangeCompanySite;