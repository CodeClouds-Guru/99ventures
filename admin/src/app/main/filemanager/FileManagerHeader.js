import {Typography, LinearProgress} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from './Header';
import BreadCrumb from './BreadCrumb';
import { useSelector } from 'react-redux'
import SelectAll from './components/SelectAll';
import Search from './components/Search';
import MainHeader from 'app/shared-components/MainHeader';

function FileManagerHeader(props) {
  const loading = useSelector(state=> state.filemanager.loading);

  return (
	<div className='w-full'>
		<MainHeader module="File Manager" slug="filemanager" />
		
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
