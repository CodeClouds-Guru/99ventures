import { useState, useEffect } from 'react';
import { Autocomplete, Chip, FormControl, TextField, Stack, Select, Card, CardContent, IconButton, MenuItem, TextareaAutosize, Switch, InputLabel, Button, Typography, InputAdornment } from '@mui/material';
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

const operators = {
    'eq_to': 'Equal To',
    'not_eq_to': 'Not Equal To',
    'gt_than': 'Greater Than',
    'lt_than': 'Less Than',
    'gt_eq': 'Greater Than and Equal To',
    'lt_eq': 'Less Than and Equal To'
}


const CreateUpdate = () => {
    const [expanded, setExpanded] = useState('panel1');
    const [rules, setRules] = useState(['Rule1']);
    const [loading, setLoading] = useState(false);
    const [logicalOperator, setLogicalOperator] = useState('');
    const [rulesCreate, setRulesCreate] = useState('');
    const [selectRules, setSelectRules] = useState('');
    const [rulesArry, setRulesArry] = useState({});
    const [helpertext, setHelpertext] = useState('');
    const [rewardsType, setRewardsType] = useState(true);
    const {moduleId} = useParams();

    const handleSetRewards = (e) => {
        setRewardsType(!rewardsType)
    }

    const handleChange =
      (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    const handleBuildRules = (indx, type, value) => {
        let arry = {...rulesArry};
        indx = 'Rule'+indx;
        arry[indx] = {
            ...rulesArry[indx],
            [type]: value
        };
        setRulesArry(arry);
    }
    
    useEffect(()=>{
          console.log(rulesArry)
        // rulesHtml();
      }, [rulesArry])

    const rulesHtml = () => {
        var htmlContent = [];
        for(let i=0; i<rules.length; i++){
            htmlContent.push(
                <div className='flex items-center justify-between mb-20'>
                    <div className='w-1/12'>
                        <Typography variant="subtitle1">Rule {i+1}</Typography>
                    </div>
                    <FormControl className="w-1/4 ">
                        <InputLabel id="action-select-label">Actions</InputLabel>
                        <Select
                            labelId="action-select-label"
                            id="action-select"
                            value={rulesArry['Rule'+(i+1)] !== undefined && rulesArry['Rule'+(i+1)].hasOwnProperty('action') ? rulesArry['Rule'+(i+1)].action : ''}
                            label="Action"
                            onChange={(e)=>handleBuildRules(i+1, 'action', e.target.value)}
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="Days From Registration">Days From Registration</MenuItem>
                            <MenuItem value="No. of Withdrawal">No. of Withdrawal</MenuItem>
                            <MenuItem value="Total Withdrawal">Total Withdrawal</MenuItem>
                            <MenuItem value="Email Verification">Email Verification</MenuItem>
                            <MenuItem value="Signed Up">Signed Up</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <InputLabel id="operator-select-label">Operators</InputLabel>
                        <Select
                            label="Operator"
                            labelId="operator-select-label"
                            id="operator-select"
                            value={rulesArry['Rule'+(i+1)] !== undefined && rulesArry['Rule'+(i+1)].hasOwnProperty('operator') ? rulesArry['Rule'+(i+1)].operator : ''}
                            onChange={(e)=>handleBuildRules(i+1, 'operator', e.target.value)}
                        >
                            <MenuItem value="">None</MenuItem>
                            {
                                Object.keys(operators).map(op=> {
                                    return <MenuItem value={op}>{operators[op]}</MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <TextField
                            required
                            id="outlined-required"
                            label="Value"
                            value={rulesArry['Rule'+(i+1)] !== undefined && rulesArry['Rule'+(i+1)].hasOwnProperty('value') ? rulesArry['Rule'+(i+1)].value : ''}
                            onChange={(e)=>handleBuildRules(i+1, 'value', e.target.value)}
                        />
                    </FormControl>
                    <div className='w-1/12'>
                        {
                            i ? (
                                <IconButton aria-label="delete" size="large" onClick={()=>handleDeleteRule(i)}>
                                    <DeleteIcon />
                                </IconButton>
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

    const handleDeleteRule = (indx) => {
        rules.splice(indx, 1);
        setRules([...rules]);
        handleRulesCreate('');
        setHelpertext('');
    }

    const handleSelectRules = (e) =>{
        setSelectRules(e.target.value)
        if(e.target.value !== '') {
            setRulesCreate(rulesCreate=> rulesCreate+'<'+e.target.value+'>')
            // handleRulesCreate(rulesCreate=> rulesCreate+'<'+e.target.value+'>')
            handleHelperText(e.target.value, 'rules')
        }
    }

    const handleLogicalOperator = (e) => {
        setLogicalOperator(e.target.value)
        setRulesCreate(rulesCreate=> rulesCreate+e.target.value)
        // handleRulesCreate(rulesCreate=> rulesCreate+e.target.value)
        handleHelperText(e.target.value, 'operator')
    }

    const handleRulesCreate = (val) => {
        setRulesCreate(val)
        handleHelperText(val, '')
    }

    const handleHelperText = (val, type) => {
        var str = '';
        if(type === 'rules'){
            str = str +' '+ rulesArry[val].action +' '+ operators[rulesArry[val].operator] +' '+ rulesArry[val].value 
        }else if(type === 'operator') {
            str = str +' '+ val
        }else {
            str = str +' '+ val
        }
        setHelpertext(helpertext=>helpertext+str)
    }

    const handleFormSubmit = () => {}

    const handleClearRulesConfig = () => {
        handleRulesCreate('');
        setHelpertext('');
        setLogicalOperator('');
        setSelectRules('');
    }
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
                                <div className='flex py-10 items-center flex-col justify-left'>
                                    <FormControl className="w-1/2 pr-10 mb-10">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Name"
                                        />
                                    </FormControl> 
                                    <FormControl className="w-1/2 mb-10">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography>Points</Typography>
                                            <Switch className="switch" checked={rewardsType} onChange={handleSetRewards}  name="rewards_type" />
                                            <Typography>Cash</Typography>
                                        </Stack>
                                        {
                                            rewardsType ? (
                                                <TextField
                                                    required
                                                    id="outlined-required"
                                                    label="Cash"
                                                />
                                            ) : (
                                                <TextField
                                                    required
                                                    id="outlined-required"
                                                    label="Points"
                                                />
                                            )
                                        }
                                    </FormControl>
                                    <FormControl className="w-1/2 mb-10">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            type="file"
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
                                <div className='flex items-center mb-20'>
                                    <FormControl className="w-4/6" sx={{'& .MuiInputBase-formControl': {borderTopRightRadius: 0, borderBottomRightRadius: 0}}}>
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Rule Configuration"
                                            onChange={(e)=>handleRulesCreate(e.target.value)}
                                            value={rulesCreate}
                                            InputProps={rulesCreate !== '' ? {
                                                endAdornment :(
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            edge="end"
                                                            onClick={handleClearRulesConfig}
                                                        >
                                                            <FuseSvgIcon className="text-48" size={24} color="action">material-outline:cancel</FuseSvgIcon>
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }: ''}
                                        />
                                    </FormControl>
                                    <FormControl className="w-1/6 bg-gray-300" sx={{'& .MuiInputBase-formControl': {borderRadius: 0}}}>
                                        <InputLabel id="action-select-label">Rules</InputLabel>
                                        <Select
                                            labelId="action-select-label"
                                            id="action-select"
                                            value={selectRules}
                                            label="Action"
                                            onChange={handleSelectRules}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {
                                                rules.map(el => {
                                                    return <MenuItem key={el} value={el}>{el}</MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl className="w-1/6  bg-gray-300" sx={{'& .MuiInputBase-formControl': {borderRadius: 0}}}>
                                        <InputLabel id="action-select-label">Operators</InputLabel>
                                        <Select
                                            labelId="action-select-label"
                                            id="action-select"
                                            value={logicalOperator}
                                            label="Operator"
                                            onChange={handleLogicalOperator}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value="AND">AND</MenuItem>
                                            <MenuItem value="OR">OR</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <strong>{helpertext}</strong>
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

export default CreateUpdate;