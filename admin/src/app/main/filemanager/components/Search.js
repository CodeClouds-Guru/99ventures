import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, Paper, Input} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSelector, useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { setListData, setLoading, setSelectedItem } from 'app/store/filemanager'

const Search = () => {
    const dispatch = useDispatch();
    const jsonData = useSelector(state=> state.filemanager.jsonData);
	const loading = useSelector(state=> state.filemanager.loading);
    const [ inputValue, setInputValue ] = useState('');

    const delayedSearch = useCallback(
        debounce((q) => {
            const srchTxt = q.toLowerCase();
            const result = jsonData.filter(el => {
                const name = el.name.toLowerCase();
                return name.includes(srchTxt);
            });
            dispatch(setListData(result));
            dispatch(setLoading('idle'));
        }, 600),
        [jsonData]
    );

    const handleSearch = (event) => {
        if(loading === 'idle') {
            dispatch(setLoading('pending'))
        }
        setInputValue(event.target.value);
        delayedSearch(event.target.value);
        dispatch(setSelectedItem(null));    // Disabled search while searching
    }

    const clearedSearch = () => {
        setInputValue('');
        dispatch(setListData(jsonData));
    }

    /**
     * When route has changed, search field will be blank
     */
    useEffect(()=> {
        setInputValue('');
    }, [location.pathname]);

    return (
        <Paper
            component={motion.div}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            className="flex items-center w-full space-x-8 px-16 rounded-full border-1 shadow-0"
        >
            <FuseSvgIcon color="disabled">heroicons-solid:search</FuseSvgIcon>
            <Input
                placeholder={`Search `}
                className="flex flex-1"
                disableUnderline
                fullWidth
                onChange={ handleSearch }
                value={ inputValue }
                inputProps={{
                    'aria-label': `Search `,
                }}                                
            />
            { inputValue && (
                <Tooltip title="Reset">
                    <FuseSvgIcon onClick={ clearedSearch } className="text-48 cursor-pointer" size={24} color="disabled">material-outline:cancel</FuseSvgIcon>
                </Tooltip>
            )}
        </Paper>
    )
}

export default Search;