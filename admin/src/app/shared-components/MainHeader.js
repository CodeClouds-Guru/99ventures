import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';


function MainHeader(props) {
	const theme = useTheme();

	return (
		<div className="lg:py-16 md:py-16 sm:py-20 w-full flex flex-col sm:flex-row space-y-8 sm:space-y-0 items-center justify-between">
			<div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0">
				{props.backUrl && (
					<motion.div
						initial={{ x: 20, opacity: 0 }}
						animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
					>
						<Typography
							className="flex items-center sm:mb-12"
							component={Link}
							role="button"
							to={props.backUrl}
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
				)}
				<motion.span
					className="flex items-end"
					initial={{ x: -20 }}
					animate={{ x: 0, transition: { delay: 0.2 } }}
					delay={300}
				>

					<Typography
						component={Link}
						to={props.backUrl ?? '#'}
						className="text-20 md:text-24 font-extrabold tracking-tight leading-none pl-20"
						role="button"
					>
						{props.module}
					</Typography>
				</motion.span>

			</div>
		</div>
	);
}

export default MainHeader;
