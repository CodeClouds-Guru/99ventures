import { useEffect, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ClickAwayListener, IconButton, TextField, InputAdornment, Typography, Tooltip, CircularProgress } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import _ from '@lodash';
import { filemanagerUpdateFile, getMetadata, setMetaData } from 'app/store/filemanager'

const schema = yup.object().shape({
	title: yup.string().required('You must enter alt text!'),
});

const AltTag = () => {
	const dispatch = useDispatch();
	const [formOpen, setFormOpen] = useState(false);
	const selectMetadata = useSelector(state=>state.filemanager.metadata);
	const selectedItem = useSelector(state=>state.filemanager.selectedItem);
	const [ alt, setAlt ] = useState();
	const [ loader, setLoader ] = useState('idle');

	useEffect(()=>{
		setAlt(selectMetadata['x-amz-meta-alt-name']);
	}, [selectMetadata['x-amz-meta-alt-name']]);

	const { control, formState, handleSubmit, reset } = useForm({
		mode: 'onChange',
		defaultValues: {
			title: '',
		},
		resolver: yupResolver(schema),
	});

	const { isValid, dirtyFields, errors } = formState;

	function handleOpenForm(ev) {
		ev.stopPropagation();
		setFormOpen(true);
	}

	function handleCloseForm() {
		setFormOpen(false);
	}

	function onSubmit(newData) {
		setLoader('pending');
		dispatch(
			filemanagerUpdateFile({ 
				id: selectedItem.id, 
				type: 'update-metadata', 
				private: '0', 
				alt_name: newData.title 
			})
		)
		.then(res => {
			setLoader('idle');
			handleCloseForm();
			dispatch(setMetaData({...selectMetadata, 'x-amz-meta-alt-name': newData.title}));
		});
	}

	return (
		<>
			{formOpen ? (
				<ClickAwayListener onClickAway={handleCloseForm}>
					<form className="w-full" onSubmit={handleSubmit(onSubmit)}>
						<Controller
							name="title"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									variant="standard"
									margin="none"
									autoFocus
									className="w-full"
									size="small"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												{
													loader === 'idle' ? (
														<IconButton
															type="submit"
															disabled={_.isEmpty(dirtyFields) || !isValid}
															size="small"
														>
															<FuseSvgIcon className="text-48" size={20}>heroicons-outline:check</FuseSvgIcon>
														</IconButton>
													) : <CircularProgress size={16} />
												}												
											</InputAdornment>
										),
									}}
								/>
							)}
						/>
					</form>
				</ClickAwayListener>
			) : (
				<>
					<Typography color="text.secondary" onClick={handleOpenForm}>
						Alt Text: { alt && (<em>{ alt }</em>) }
					</Typography>
					<Tooltip title="Edit">
						<IconButton color="primary" aria-label="Filter" component="label" onClick={handleOpenForm}>
							<FuseSvgIcon className="text-48" size={20} color="action">material-outline:edit</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</>
			)}
		</>
	)
}

export default AltTag;