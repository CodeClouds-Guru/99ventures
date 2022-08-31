import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PaymentCredentials from './PaymentCredentials';
import axios from 'axios';


function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					{children}
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

function a11yProps(index) {
	return {
		id: `vertical-tab-${index}`,
		'aria-controls': `vertical-tabpanel-${index}`,
	};
}

const PaymentGateway = () => {
	const [value, setValue] = React.useState(0);
	const [gateways, setGateways] = React.useState([])

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	React.useEffect(() => {
		retrieveGateways();
	}, [])

	/**
	 * Retrieve list of payment gateways
	 */
	const retrieveGateways = () => {
		axios.get('payment-methods')
		.then(response => {
			if (response.data.status) {
				setGateways([...response.data.payment_method_list])
			} else {
                console.log('Error');
            }
		})
		.catch(error => console.log(error))
	}
	

	return (
		<Box
			sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 'auto' }}
		>
			<Tabs
				orientation="vertical"
				variant="scrollable"
				value={value}
				onChange={handleChange}
				aria-label="Vertical tabs example"
				sx={{ borderRight: 1, borderColor: 'divider' }}
			>
				{
					gateways.map((gateway, indx) => {
						return <Tab key={ indx } label={ gateway.name } {...a11yProps(indx)} />
					})
				}
			</Tabs>
			{
				gateways.map((gateway, indx) => {
					return (
						<TabPanel key={ indx } value={value} index={ indx } className="w-full">
							<PaymentCredentials gateway={gateway.name} credentials={ gateway.credentials }/>
						</TabPanel>
					)
				})
			}
		</Box>
	);
}

export default PaymentGateway;