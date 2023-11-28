import { useState, useEffect, } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IconButton, Typography, TextField, Tooltip } from '@mui/material';

const PaymentMethodUpdate = (props) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethodList, setPaymentMethodList] = useState([]);
    const [paymentMethodeEdit, setPaymentMethodEdit] = useState(false);

    useEffect(()=>{
        if(props.memberData.primary_payment_method_id) {
            setPaymentMethod(props.memberData.PaymentMethod.name);
        }
        setPaymentMethodList(props.memberData.all_payment_methods);
    }, [props]);

    const handleUpdatePaymentMethod = () => {
        props.updateMemberData({ type: 'change_payment_method', payment_method_id: +paymentMethod }, 'change_payment_method');
        setPaymentMethodEdit(false);
    }

    return (
        !paymentMethodeEdit ? (
            <span className='flex items-center'>
                <Typography variant="body1" className="sm:text-lg md:text-lg lg:text-sm xl:text-base text-sm mr-3">
                    { (props.memberData.primary_payment_method_id > 0) ? props.memberData.PaymentMethod?.name : '--'}
                </Typography>
                <Tooltip title="Payment Method" placement="top-start">
                    <IconButton color="primary" aria-label="edit_payment_method" component="span" sx={props.iconLabel} onClick={() => setPaymentMethodEdit(true)}>
                        <FuseSvgIcon sx={props.iconStyle} className="text-48" size={14} color="action">heroicons-outline:pencil</FuseSvgIcon>
                    </IconButton>
                </Tooltip>
            </span>
        ) : (
            <div className='flex items-center'>
                <TextField
                    sx={{
                        ...props.selectStyle,
                        ...props.textFieldStyle
                    }}
                    id="standard-select-currency-native"
                    select
                    value={paymentMethod}
                    SelectProps={{
                        native: true,
                    }}
                    onChange={
                        (e) => {
                            if (e.target.value) {
                                setPaymentMethod(e.target.value)
                            }
                        }
                    }
                    variant="standard"
                >
                    <option value="">--Select--</option>
                    {
                        paymentMethodList && paymentMethodList.map(row => <option key={row.id} value={row.id}>{row.name}</option>)
                    }
                </TextField>
                <Tooltip title="Cancel" placement="top-start" >
                    <IconButton color="primary" aria-label="Filter" component="span" sx={props.iconLabel} onClick={() => setPaymentMethodEdit(false)}>
                        <FuseSvgIcon sx={props.iconStyle} className="text-48" size={14} color="action">material-outline:cancel</FuseSvgIcon>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Save admin status" placement="top-start" >
                    <IconButton color="primary" aria-label="Filter" component="span" sx={props.iconLabel} onClick={ handleUpdatePaymentMethod } >
                        <FuseSvgIcon sx={props.iconStyle} className="text-48" size={14} color="action">material-outline:check</FuseSvgIcon>
                    </IconButton>
                </Tooltip>
            </div>
        )
    )
}

export default PaymentMethodUpdate;