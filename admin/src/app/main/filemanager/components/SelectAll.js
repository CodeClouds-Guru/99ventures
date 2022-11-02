import { setSelectedItemsId } from 'app/store/filemanager'
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, FormGroup, FormControlLabel} from '@mui/material';

const selectAll = () => {
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const listData = useSelector(state=> state.filemanager.listData)
    const dispatch = useDispatch();

    const handleChange = (event) => {
        if(event.target.checked){
            const ids = listData.filter(el => el.type !== 'folder').map(el=> el.id);
            dispatch(setSelectedItemsId(ids))
        } else {
            dispatch(setSelectedItemsId([]));
        }        
    };

    return (
        <FormGroup className="flex" variant="outlined">
            <FormControlLabel control={
                <Checkbox                     
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                    checked={ Boolean(
                        selectedItemsId.length && selectedItemsId.length === listData.filter(el => el.type !== 'folder').length
                    ) }
                    onChange={handleChange} 
                    inputProps={{ 'aria-label': 'controlled', 'disabled': (listData.length < 1 ? true : false) }}
                />
            } label="Select All" />
        </FormGroup>
    )
}

export default selectAll;