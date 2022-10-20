import {Typography, LinearProgress} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from './Header';
import BreadCrumb from './BreadCrumb';
import { useSelector } from 'react-redux'
import SelectAll from './components/SelectAll';
import Search from './components/Search';

function FileManagerHeader(props) {
  const loading = useSelector(state=> state.filemanager.loading);

  return (
	<div className='w-full'>
		<div className="lg:py-24 md:20 sm:py-20 w-full flex flex-col sm:flex-row space-y-8 sm:space-y-0 items-center justify-between">
			<div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0">
				<motion.span
					className="flex items-end"
					initial={{ x: -20 }}
					animate={{ x: 0, transition: { delay: 0.2 } }}
					delay={300}
				>
				
					<Typography
						component={Link}
						to="/apps/filemanager"
						className="text-20 md:text-32 font-extrabold tracking-tight leading-none"
						role="button"
					>
						File Manager
					</Typography>
				</motion.span>
			</div>
		</div>
		
		<Header 
			selectAll={<SelectAll/>}
			search={<Search/>}
			>
		</Header>
		<BreadCrumb/>
		{
			loading == 'pending' && (
				<LinearProgress sx={{				
					borderTopLeftRadius: '2rem',
					borderTopRightRadius: '2rem',
					top: '5px',
					zIndex: '99',
					margin: '0 6px',
					height: '5px'
				}}/>
			)
		}		
		
	</div>
  );
}

export default FileManagerHeader;
