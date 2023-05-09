import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Stack, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';

const buttonStyle = {
    borderRadius: '5px',
    paddingLeft: 6,
    paddingRight: 6,
    '@media screen and (max-width: 768px)': {
        fontSize: '1rem',
        width: '70px',
    },
    '@media screen and (max-width: 1400px)': {
        width: '105px',
        paddingLeft: '18px',
        paddingRight: '18px',
        fontSize: '1.2rem'

    },
    '@media screen and (max-width: 1700px)': {
        width: '130px',
        paddingLeft: '22px',
        paddingRight: '22px',
        fontSize: '1.3rem'

    }
}

function WithdrawalRequestsHeader(props) {
    const withdrawalTypes = props.withdrawalTypesProps;
    const [clickedBtn, setClickedBtn] = useState(null);
    const clickesWithdrawalTypes = (id) => {
        setClickedBtn(id);
        props.withdrawalTypeID(id);
    }
    useEffect(() => {
        withdrawalTypes.length > 0 ? clickesWithdrawalTypes(withdrawalTypes[0].id) : '';
    }, [withdrawalTypes]);

    return (
        <div className="flex xl:flex-row lg:flex-row md:flex-col sm:flex-col flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-12 ">
            <Stack spacing={{ sm: 1, lg: 2 }} direction="row" className="justify-between ml-auto">
                {
                    withdrawalTypes.map((row) => {
                        return (
                            <Button key={row.id} variant={(clickedBtn === row.id) ? 'outlined' : 'contained'} size="large" sx={buttonStyle} onClick={() => { clickesWithdrawalTypes(row.id) }}>
                                {row.name}
                            </Button>
                        )
                    })
                }
            </Stack>
        </div>

    );
}

export default WithdrawalRequestsHeader;