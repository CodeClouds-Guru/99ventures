import {Typography} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function MainHeader(props) {
  return (	
	<div className="lg:py-24 md:py-20 sm:py-20 w-full flex flex-col sm:flex-row space-y-8 sm:space-y-0 items-center justify-between">
		<div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0">
			<motion.span
				className="flex items-end"
				initial={{ x: -20 }}
				animate={{ x: 0, transition: { delay: 0.2 } }}
				delay={300}
			>
			
				<Typography
					component={Link}
					to={`/app/${props.slug}`}
					className="text-20 md:text-32 font-extrabold tracking-tight leading-none"
					role="button"
				>
					{ props.module }
				</Typography>
			</motion.span>
		</div>
	</div>
  );
}

export default MainHeader;
