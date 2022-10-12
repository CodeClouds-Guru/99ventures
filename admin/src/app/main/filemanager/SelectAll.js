import { setSelectedItemsId } from 'app/store/filemanager'
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, FormGroup, FormControlLabel} from '@mui/material';

const selectAll = () => {
    const selectedItemsId = useSelector(state=> state.filemanager.selectedItemsId);
    const jsonData = useSelector(state=> state.filemanager.jsonData)
    const dispatch = useDispatch();

    // console.log(selectedItemsId)

    const handleChange = (event) => {
        if(event.target.checked){
            const ids = jsonData.map(el=> el.id);
            dispatch(setSelectedItemsId(ids))
        } else {
            dispatch(setSelectedItemsId([]));
        }        
    };

    return (
        <FormGroup className="flex" variant="outlined">
            <FormControlLabel control={
                <Checkbox 
                    checked={ Boolean(
                        selectedItemsId.length && selectedItemsId.length === jsonData.length
                    ) }
                    onChange={handleChange} 
                    inputProps={{ 'aria-label': 'controlled' }}
                />
            } label="Select All" />
        </FormGroup>
    )
}

export default selectAll;