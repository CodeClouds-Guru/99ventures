import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Stack, Typography, Button } from '@mui/material';

const buttonStyle = {
    borderRadius: '5px',
    paddingLeft: 6,
    paddingRight: 6,
    '@media screen and (max-width: 1700px)': {
        width: '130px',
        paddingLeft: '22px',
        paddingRight: '22px',
        fontSize: '1.3rem'

    },    
    '@media screen and (max-width: 1400px)': {
        width: '105px',
        paddingLeft: '18px',
        paddingRight: '18px',
        fontSize: '1.2rem'

    },
    '@media screen and (max-width: 768px)': {
        fontSize: '1rem',
        width: '90px',
    }
}



function PageHeader(props) {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();
    const moduleId = params.moduleId;
    const activeBtn = props.button;

    return (
        <div className="flex xl:flex-row lg:flex-row md:flex-col sm:flex-col flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-12 ">
            <div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0  sm:mb-16 mb-0 mr-auto">
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
                >
                    <Typography
                        className="flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to={`/app/members`}
                        color="inherit"
                    >
                        <FuseSvgIcon size={20}>
                            {theme.direction === 'ltr'
                                ? 'heroicons-outline:arrow-sm-left'
                                : 'heroicons-outline:arrow-sm-right'}
                        </FuseSvgIcon>
                        <span className="flex mx-4 font-medium capitalize">Back</span>
                    </Typography>
                </motion.div>

                <div className="flex items-center max-w-full">
                    <motion.div
                        className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
                        initial={{ x: -20 }}
                        animate={{ x: 0, transition: { delay: 0.3 } }}
                    >
                        <Typography variant="h5" className="truncate font-semibold">
                            {props.module}
                        </Typography>

                    </motion.div>
                </div>
            </div>
            <Stack spacing={{ sm: 1, lg: 2 }} direction="row" className="justify-between ml-auto">
                <Button variant={(activeBtn === 'profile') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId)}>Profile</Button>
                <Button variant={(activeBtn === 'history') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId + '/history')}>History</Button>
                <Button variant={(activeBtn === 'downline') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId + '/downline')}>Downline</Button>
                <Button variant={(activeBtn === 'iplogs') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId + '/iplogs')}>IP Log</Button>
                <Button variant={(activeBtn === 'withdraws') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId + '/withdraws')}>Withdraws</Button>
                <Button variant={(activeBtn === 'alerts') ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => navigate('/app/members/' + moduleId + '/alerts')}>Alerts</Button>
            </Stack>
        </div>

    );
}

export default PageHeader;
