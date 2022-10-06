import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
// import { selectFiles, selectFolders, selectPath } from './store/itemsSlice';
import { useTheme } from '@mui/material/styles';
import Header from './Header';

function FileManagerHeader(props) {
  const theme = useTheme();

  return (
	<div className='w-full'>
		<div className="p-24 sm:p-32 w-full flex flex-col sm:flex-row space-y-8 sm:space-y-0 items-center justify-between">
			<div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0">
				<FuseSvgIcon size={20}>
					{theme.direction === 'ltr'
					? 'heroicons-outline:arrow-sm-left'
					: 'heroicons-outline:arrow-sm-right'}
				</FuseSvgIcon>
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

		<Header/>
		<div className='breadcrumb py-24 flex items-center'>
			<FuseSvgIcon className="text-48" size={30} color="action">material-outline:home</FuseSvgIcon> <span>/</span>
		</div>
	</div>
  );
}

export default FileManagerHeader;
