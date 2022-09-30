import { setSelectAll } from 'app/store/filemanager'
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, FormGroup, FormControlLabel} from '@mui/material';

const selectAll = () => {
    const selectAll = useSelector(state=> state.filemanager.selectAll);
    const dispatch = useDispatch();

    const handleChange = (event) => {
        dispatch(setSelectAll(event.target.checked))
    };
    return (
        <FormGroup className="flex" variant="outlined">
            <FormControlLabel control={
                <Checkbox 
                    checked={ selectAll }
                    onChange={handleChange} 
                    inputProps={{ 'aria-label': 'controlled' }}
                />
            } label="Select All" />
        </FormGroup>
    )
}

export default selectAll;