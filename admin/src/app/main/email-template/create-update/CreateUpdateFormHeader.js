import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function CreateUpdateFormHeader(props) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    const moduleId = props.moduleId;

    return (
        <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-32 px-24 md:px-32">
            <div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
                >
                    <Typography
                        className="flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to={`/app/email-templates`}
                        color="inherit"
                    >
                        <FuseSvgIcon size={20}>
                            {theme.direction === 'ltr'
                                ? 'heroicons-outline:arrow-sm-left'
                                : 'heroicons-outline:arrow-sm-right'}
                        </FuseSvgIcon>
                        <span className="flex mx-4 font-medium capitalize">Email Templates</span>
                    </Typography>
                </motion.div>

                <motion.div className="flex items-center max-w-full">
                    <div
                        className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
                        initial={{ x: -20 }}
                        animate={{ x: 0, transition: { delay: 0.3 } }}
                    >
                        <Typography className="text-16 sm:text-20 truncate font-semibold">
                            {moduleId === 'create' ? `Add New` : `Edit`}
                        </Typography>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default CreateUpdateFormHeader;
