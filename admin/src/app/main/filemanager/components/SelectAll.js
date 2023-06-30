import { setSelectedItemsId } from 'app/store/filemanager'
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, FormGroup, FormControlLabel} from '@mui/material';

const selectAll = () => {
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const listData = useSelector(state=> state.filemanager.listData);
    const fileLists = listData.filter(el => el.type !== 'folder');
    const dispatch = useDispatch();

    const handleChange = (event) => {
        if(event.target.checked){
            const ids = fileLists.map(el=> el.id);
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
                        selectedItemsId.length && selectedItemsId.length === fileLists.length
                    ) }
                    onChange={handleChange} 
                    inputProps={{ 'aria-label': 'controlled', 'disabled': (fileLists.length < 1 ? true : false) }}
                />
            } label="Select All" />
        </FormGroup>
    )
}

export default selectAll;