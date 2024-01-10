import { useState, useEffect } from 'react';
import { Autocomplete, Chip, FormControl, TextField, Stack, Select, Card, CardContent, IconButton, MenuItem, TextareaAutosize, Switch, InputLabel, Button, Typography, InputAdornment, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import Helper from 'src/app/helper';
import { customCodeEditor } from '../../grapesjs/editorPlugins'
import { selectUser } from 'app/store/userSlice';
import FusePageCardSimple from '@fuse/core/FusePageCarded';
import MainHeader from 'app/shared-components/MainHeader';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DeleteIcon from '@mui/icons-material/Delete';

import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';


const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));
  
  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  }));

const CreateUpdateNew = () => {
    const [expanded, setExpanded] = useState('panel1');
    const [rules, setRules] = useState(['Rule1']);
    const [subrules, setSubrules] = useState([]);
    const [loading, setLoading] = useState(false);
    const {moduleId} = useParams();


    const handleChange =
      (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
      };

    //   useEffect(()=>{
    //     rulesHtml();
    //   }, [rules])

    const rulesHtml = () => {
        var htmlContent = [];
        for(let i=0; i<rules.length; i++){
            htmlContent.push(
                <div>
                    {
                        i ? (
                            <div className='flex justify-center my-20'>
                                <FormControl className="w-1/4 ">
                                    <InputLabel id="operator-select-label">Operator</InputLabel>
                                    <Select
                                        label="Operator"
                                        labelId="operator-select-label"
                                        id="operator-select"
                                        value={10}
                                    >
                                        <MenuItem value={10}>OR</MenuItem>
                                        <MenuItem value={20}>AND</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        ) : ''
                    }
                    <fieldset className='border-2 p-20 relative'>
                        <legend className='p-10'>Rule {i+1}</legend>
                        {
                            i ? (
                                <Tooltip placement="top" title="Delete Rule">
                                    <IconButton className="rule-main-delete" aria-label="delete" size="large" onClick={()=>handleDeleteRule(i)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        }
                        <div className='flex items-center justify-between mb-20'>
                            {/* <div className='w-1/12'>
                                <Typography variant="subtitle1">Rule {i+1}</Typography>
                            </div> */}
                            <FormControl className="w-1/4 ">
                                <InputLabel id="action-select-label">Action</InputLabel>
                                <Select
                                    labelId="action-select-label"
                                    id="action-select"
                                    value={10}
                                    label="Action"
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value={10}>Days From Registration</MenuItem>
                                    <MenuItem value={20}>No. of Withdrawal</MenuItem>
                                    <MenuItem value={20}>Total Withdrawal</MenuItem>
                                    <MenuItem value={30}>Email Verification</MenuItem>
                                    <MenuItem value={30}>Signed Up</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl className="w-1/4 ">
                                <InputLabel id="operator-select-label">Operator</InputLabel>
                                <Select
                                    label="Operator"
                                    labelId="operator-select-label"
                                    id="operator-select"
                                    value={10}
                                >
                                    <MenuItem value={10}>Equal</MenuItem>
                                    <MenuItem value={20}>Not Equal</MenuItem>
                                    <MenuItem value={30}>Greater Than</MenuItem>
                                    <MenuItem value={30}>Less Than</MenuItem>
                                    <MenuItem value={30}>Greater Than and Equal</MenuItem>
                                    <MenuItem value={30}>Less Than and Equal</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl className="w-1/4 ">
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Value"
                                />
                            </FormControl>
                            <div className='w-1/12'>
                                <Tooltip placement="top" title="Add Sub Rule">
                                    <IconButton aria-label="delete" size="large" onClick={()=>handleAddSubRule(i)}>
                                        <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:plus</FuseSvgIcon>
                                    </IconButton>
                                </Tooltip>
                                {
                                    i ? (
                                        <Tooltip placement="top" title="Delete Sub Rule">
                                            <IconButton aria-label="delete" size="large" onClick={()=>handleDeleteRule(i)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : ''
                                }
                            </div>
                        </div>
                        {subRules()}
                    </fieldset>
                    
                </div>
            )
        }
        return htmlContent;
    }

    const subRules = () => {
        var htmlContent = [];
        for(let i=0; i<subrules.length; i++){
            htmlContent.push(
                <div className='flex items-center justify-between mb-20'>
                    {/* <div className='w-1/12'>
                        <Typography variant="subtitle1">Rule {i+1}</Typography>
                    </div> */}
                    <FormControl className="w-1/4 ">
                        <InputLabel id="action-select-label">Action</InputLabel>
                        <Select
                            labelId="action-select-label"
                            id="action-select"
                            value={10}
                            label="Action"
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value={10}>Days From Registration</MenuItem>
                            <MenuItem value={20}>No. of Withdrawal</MenuItem>
                            <MenuItem value={20}>Total Withdrawal</MenuItem>
                            <MenuItem value={30}>Email Verification</MenuItem>
                            <MenuItem value={30}>Signed Up</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <InputLabel id="operator-select-label">Operator</InputLabel>
                        <Select
                            label="Operator"
                            labelId="operator-select-label"
                            id="operator-select"
                            value={10}
                        >
                            <MenuItem value={10}>Equal</MenuItem>
                            <MenuItem value={20}>Not Equal</MenuItem>
                            <MenuItem value={30}>Greater Than</MenuItem>
                            <MenuItem value={30}>Less Than</MenuItem>
                            <MenuItem value={30}>Greater Than and Equal</MenuItem>
                            <MenuItem value={30}>Less Than and Equal</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <TextField
                            required
                            id="outlined-required"
                            label="Value"
                        />
                    </FormControl>
                    <div className='w-1/12'>
                        <Tooltip placement="top" title="Add Sub Rule">
                            <IconButton aria-label="delete" size="large" onClick={()=>handleAddSubRule(i)}>
                                <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:plus</FuseSvgIcon>
                            </IconButton>
                        </Tooltip>
                        {
                            i ? (
                                <Tooltip placement="top" title="Delete Sub Rule">
                                    <IconButton aria-label="delete" size="large" onClick={()=>handleDeleteRule(i)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        }
                    </div>
                </div>
            )
        }
        return htmlContent;
    }

    const handleAddRules = () => {
        setRules([...rules, `Rule${rules.length+1}`]);
    }

    const handleAddSubRule = () => {
        setSubrules([...subrules, `Subrule${rules.length+1}`]);
    }

    const handleDeleteRule = (indx) => {
        rules.splice(indx, 1);
        setRules([...rules]);
    }

    const handleFormSubmit = () => {}
    return (
        <FusePageCardSimple
            header={
                <MainHeader module="Membership" backUrl="/app/membership" />
            }
            content={
                <>
                    <div className="mb-10 w-full p-20">
                       
                        <Accordion expanded={true} onChange={handleChange('panel1')}>
                            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                <Typography>Membership</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className='flex py-10 items-center'>
                                    <FormControl className="w-1/2 pr-10">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Name"
                                        />
                                    </FormControl>
                                    <FormControl className="w-1/2">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Logo"
                                        />
                                    </FormControl>
                                </div>                                
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={true} onChange={handleChange('panel2')}>
                            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                                <Typography>Rules</Typography>
                            </AccordionSummary>
                            <AccordionDetails className="py-10">
                                <div className='text-right'>
                                    <Button variant="outlined" onClick={handleAddRules}>
                                        <FuseSvgIcon className="text-48" size={24} color="action">heroicons-outline:plus</FuseSvgIcon>
                                        Add Rule
                                    </Button>
                                </div>
                                <div className='my-40'>
                                    {rulesHtml()}
                                </div>
                                {/* <div className='flex items-center mb-20'>
                                    <FormControl className="w-1/2">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Rules"
                                        />
                                    </FormControl>
                                    <FormControl className="w-1/4 ">
                                        <InputLabel id="action-select-label">Rules</InputLabel>
                                        <Select
                                            labelId="action-select-label"
                                            id="action-select"
                                            value={10}
                                            label="Action"
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {
                                                rules.map(el => {
                                                    return <MenuItem key={el} value={el}>{el}</MenuItem>
                                                })
                                            }                                            
                                        </Select>
                                    </FormControl>
                                    <FormControl className="w-1/4 ">
                                        <InputLabel id="action-select-label">Operator</InputLabel>
                                        <Select
                                            labelId="action-select-label"
                                            id="action-select"
                                            value={''}
                                            label="Action"
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value={10}>AND</MenuItem>
                                            <MenuItem value={20}>OR</MenuItem>
                                            
                                        </Select>
                                    </FormControl>
                                </div> */}
                            </AccordionDetails>
                        </Accordion>
                        <motion.div
                            className="flex mt-32"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                        >
                            <LoadingButton
                                variant="contained"
                                color="secondary"
                                aria-label="Register"
                                type="submit"
                                loading={loading}
                                onClick={handleFormSubmit}
                            >
                                {moduleId === 'create' ? 'Save' : 'Save'}
                            </LoadingButton>
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="error"
                            >
                                Cancel
                            </Button>
                        </motion.div>
                    </div>
                </>        
            }
            scroll="page"
        />
    )
}

export default CreateUpdateNew;