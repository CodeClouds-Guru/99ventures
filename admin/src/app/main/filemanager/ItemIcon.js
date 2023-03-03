import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { blueGrey } from '@mui/material/colors';
import { useSelector } from 'react-redux';


const TypeBadge = styled(Box)(
	({ theme, ...props }) => ({
		backgroundColor: props.color,
	})
);

const badgeComponent = (type, color) => {
	return (
		<div className="relative">
			<FuseSvgIcon className="fuse--icon" size={56} color="disabled">
				heroicons-outline:document
			</FuseSvgIcon>
			<TypeBadge
				color={color}
				className="type-badge absolute left-0 bottom-0 px-6 rounded text-12 font-semibold leading-20 text-white"
			>
				{type}
			</TypeBadge>
		</div>
	)
}


function ItemIcon(props) {
	const selectTypes = useSelector(state => state.filemanager.allTypes)
	
	const { file } = props;
	if (file.type === 'folder') {
		return (
			<div className="relative">
			<FuseSvgIcon className="fuse--icon" size={60} color="disabled">
				material-outline:folder_open
			</FuseSvgIcon></div>
		);
	}
	if(file.mime_type.includes('image') && !file.mime_type.includes('image/svg+xml')) {
		return (
			<div className='img-div'>		
				<img
					src={file.file_path}
					alt="lorem ipsum"
					loading="lazy"
					className='rounded-md'
					style={{
						borderBottomLeftRadius: 4,
						borderBottomRightRadius: 4,
						display: 'block',
						width: '100%',
						height: '60px',
						objectFit: 'cover'
					}}
				/>		
			</div>		
		)
	} else {
		const type = selectTypes.filter(el => (el.mime_type === file.mime_type || el.obsolete_mime_type === file.mime_type ));
		if(type.length){
			return badgeComponent(type[0].ext, type[0].color);
		}
	}
	return badgeComponent('unknown', blueGrey[900])
}

export default ItemIcon;