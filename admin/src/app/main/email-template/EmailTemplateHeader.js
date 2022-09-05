import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function EmailTemplateHeader(props) {
    const customAddURL = props.customAddURL ?? `/app/email-template/create`;
    console.log(customAddURL)
    return (
        <div className="flex flex-col sm:flex-row flex-1 w-full space-y-8 sm:space-y-0 items-center justify-between py-32 px-24 md:px-32">
            <Typography
                component="span"
                initial={{ x: -20 }}
                animate={{ x: 0, transition: { delay: 0.2 } }}
                delay={300}
                className="flex text-24 md:text-32 font-extrabold tracking-tight capitalize"
            >
                Email Template
            </Typography>

            <div className="flex flex-1 items-center justify-end space-x-8 w-full sm:w-auto">
                <div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                >
                    <Button
                        className=""
                        component={Link}
                        to={customAddURL}
                        variant="contained"
                        color="secondary"
                        startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default EmailTemplateHeader;