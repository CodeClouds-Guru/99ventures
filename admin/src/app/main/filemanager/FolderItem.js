import { Typography, IconButton, Checkbox } from '@mui/material';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
// import { useDispatch } from 'react-redux';
// import { setSelectedItem } from './store/itemsSlice';
import ItemIcon from './ItemIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItemsId } from 'app/store/filemanager'

function FolderItem(props) {
	const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
	const dispatch = useDispatch();
	// const { item } = props;

	// if (!item) {
	// 	return null;
	// }

	const handleChange = (event) => {
        if(!event.target.checked && selectedItemsId.includes(props.file.id)){
            const ids = selectedItemsId.filter(el=> el !== props.file.id);
            dispatch(setSelectedItemsId(ids))
        } else {
            dispatch(
                setSelectedItemsId([...selectedItemsId, props.file.id])
            )            
        }
    }

	return (
		<Box
			sx={{ backgroundColor: 'background.paper' }}
			className="relative w-full sm:w-160 h-160 m-8 p-16 shadow rounded-16 folder--box"
		>
			<IconButton
                className="absolute z-20 top-0 right-0 m-6 w-32 h-32 min-h-32"
            >
                <Checkbox 
                    checked={ selectedItemsId.includes(props.file.id) }
                    inputProps={{ 'aria-label': 'controlled' }}
                    onChange={handleChange} 
                />
            </IconButton>
			<NavLinkAdapter
				className="flex flex-col h-full w-full"
				to={`/app/filemanager/ss`}
				role="button"
			>
				<div className="flex flex-auto w-full items-center justify-center">
					<ItemIcon className="" type="folder" />
				</div>
				<div className="flex shrink flex-col justify-center text-center">
					<Typography className="truncate text-12 font-medium">Folder</Typography>
					{/* {item.contents && (
						<Typography className="truncate text-12 font-medium" color="text.secondary">
							{item.contents}
						</Typography>
					)} */}
				</div>
			</NavLinkAdapter>
		</Box>
	);
}

export default FolderItem;
