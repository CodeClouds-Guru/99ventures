import { useState, useEffect } from 'react';
import { FormControl, TextField, Stack, Select, FormControlLabel, IconButton, MenuItem, Switch, InputLabel, Button, Typography, InputAdornment, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useParams, useNavigate } from 'react-router-dom';
import jwtServiceConfig from 'src/app/auth/services/jwtService/jwtServiceConfig';
import Helper from 'src/app/helper';
import FusePageCardSimple from '@fuse/core/FusePageCarded';
import MainHeader from 'app/shared-components/MainHeader';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import _ from 'lodash';

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
    '===': 'Equals To',
    '!==': 'Not Equals To',
    '>': 'Greater Than',
    '<': 'Less Than',
    '>=': 'Greater Than and Equals To',
    '<=': 'Less Than and Equals To'
}

const logicalOp = {
    '&&': 'AND',
    '||': 'OR'
}

const CreateUpdate = () => {
    const {moduleId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [symbol, setSymbol] = useState([]);
    const [loading, setLoading] = useState(false);
    const [helpertext, setHelpertext] = useState('');
    const [rulesCreate, setRulesCreate] = useState('');
    const [selectRules, setSelectRules] = useState('');
    const [rulesAction, setRulesAction] = useState([]);
    const [rewardsType, setRewardsType] = useState(true);
    const [rulesStatement, setRulesStatement] = useState([]);
    const [rulesJson, setRulesJson] = useState({'Rule1':{}});
    const [membershipName, setMembershipName] = useState('');
    const [membershipLogo, setMembershipLogo] = useState('');
    const [logicalOperator, setLogicalOperator] = useState('');
    const [monetoryBenefit, setMonetoryBenefit] = useState(false);
    const [membershipRewards, setMembershipRewards] = useState(0);
    const [expanded, setExpanded] = useState(['panel1', 'panel2']);
    const [logo, setLogo] = useState('');

    const handleSetRewardsType = (e) => {
        setRewardsType(!rewardsType)
    }

    const handleChange = (panel) => (event, newExpanded) => {
        if(newExpanded){
            setExpanded([...expanded, panel]);
        } else {
            let data = expanded.filter(r=> r !== panel);
            setExpanded(data);
        }
    };

    const handleBuildRules = (indx, type, value) => {
        let arry = {...rulesJson};
        indx = 'Rule'+indx;
        arry[indx] = {
            ...rulesJson[indx],
            [type]: value
        };
        if(type === 'action') {
            let act = rulesAction.find(act=> act.id === value);
            arry[indx]['action_variable'] = act.variable;
        }
        setRulesJson(arry);
    }

    const getActionsData = ()=> {
        axios.get(jwtServiceConfig.membershipAdd)
        .then((response) => {
            setRulesAction(response.data.results.rule_actions)
        })
        .catch((error) => {
            console.log(error)
            dispatch(showMessage({ variant: 'error', message: error.response.data.message }))
        })
    } 

    const rulesHtml = () => {
        var htmlContent = [];
        let rulesArry = Object.keys(rulesJson);
        return rulesArry.map((row, i)=>{
            return (
                <div className='flex items-center justify-between mb-20' key={i}>
                    <div className='w-1/12'>
                        <Typography variant="subtitle1">Rule {i+1}</Typography>
                    </div>
                    <FormControl className="w-1/4 ">
                        <InputLabel id="action-select-label">Actions</InputLabel>
                        <Select
                            labelId="action-select-label"
                            id="action-select"
                            value={rulesJson[row].hasOwnProperty('action') ? rulesJson[row]['action']: ''}
                            label="Action"
                            onChange={(e)=>handleBuildRules(i+1, 'action', e.target.value)}
                        >
                            <MenuItem value="0">None</MenuItem>
                            {
                                rulesAction.length ? rulesAction.map(act => {
                                    return <MenuItem key={act.id} value={act.id}>{act.name}</MenuItem>
                                }) : ''
                            }
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <InputLabel id="operator-select-label">Operators</InputLabel>
                        <Select
                            label="Operator"
                            labelId="operator-select-label"
                            id="operator-select"
                            value={rulesJson[row].hasOwnProperty('operator') ? rulesJson[row]['operator']: ''}
                            onChange={(e)=>handleBuildRules(i+1, 'operator', e.target.value)}
                        >
                            <MenuItem value="">None</MenuItem>
                            {
                                Object.keys(operators).map((op, i)=> {
                                    return <MenuItem value={op} key={i}>{operators[op]}</MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>
                    <FormControl className="w-1/4 ">
                        <TextField
                            required
                            id="outlined-required"
                            label="Value"
                            value={rulesJson[row].hasOwnProperty('value') ? rulesJson[row]['value']: ''}
                            onChange={(e)=>handleBuildRules(i+1, 'value', e.target.value)}
                        />
                    </FormControl>
                    <div className='w-1/12'>
                        {
                            ((rulesArry.length-1) === i && i) ? (
                                <IconButton aria-label="delete" size="large" onClick={()=>handleDeleteRule(Object.keys(rulesJson)[i])}>
                                    <DeleteIcon />
                                </IconButton>
                            ) : ''
                        }
                    </div>
                </div>
            )
        })
    }

    const handleAddRules = () => {
        var flag = true;
        let rules = Object.keys(rulesJson);
        rules.forEach(el=>{
            if(rulesJson[el].hasOwnProperty('action') && rulesJson[el].hasOwnProperty('operator')){
                flag = true;
            } else {
                flag = false
            }
        })
        if(!flag){
            dispatch(showMessage({ variant: 'error', message: 'Existing rules have not created properly!' }));
            return;
        }
        setRulesJson({
            ...rulesJson, 
            [`Rule${Object.keys(rulesJson).length+1}`]: {}
        });
    }

    const handleDeleteRule = (indx) => {
        delete rulesJson[indx];
        setRulesJson({...rulesJson});
        handleRulesCreate('');
        setHelpertext('');
        setRulesStatement([]);
    }

    const handleSelectRules = (e) => {
        if(rulesStatement.length && !['AND', 'OR', '('].includes(rulesStatement[rulesStatement.length -1])){
            dispatch(showMessage({ variant: 'error', message: 'Operator needs to add!' }));
            return;
        }
        let val = e.target.value;
        if(val !== '') {
            setRulesStatement([...rulesStatement, val]);
        }
    }

    const handleLogicalOperator = (e) => {
        if(!rulesStatement.length || ['AND', 'OR', '('].includes(rulesStatement[rulesStatement.length -1])){
            dispatch(showMessage({ variant: 'error', message: 'Operand needs to add!' }));
            return;
        }
        let val = e.target.value;
        setRulesStatement([...rulesStatement, logicalOp[val]]);
    }

    const handleSymbol = (e) => {
        let val = e.target.value;
        if(
            (val === '(' && rulesStatement.length &&
                (
                    [')'].includes(rulesStatement[rulesStatement.length -1]) || 
                    !['AND', 'OR'].includes(rulesStatement[rulesStatement.length -1])
                )
            ) ||
            (val === ')' && (!rulesStatement.length || ['(', 'AND', 'OR'].includes(rulesStatement[rulesStatement.length -1])))
        ){
            dispatch(showMessage({ variant: 'error', message: 'Please check your entry!' }));
            return;
        }
        setRulesStatement([...rulesStatement, e.target.value]);
    }

    const handleRulesCreate = (val) => {
        setRulesCreate(val);
        handleHelperText('');
    }

    useEffect(()=>{
        handleHelperText();
    }, [rulesStatement]);

    const handleHelperText = () => {
        const ruleKeys = Object.keys(rulesJson);
        var rulesConfig = '';
        const finalArry = rulesStatement.map(el => {
            rulesConfig = rulesConfig !== '' ? rulesConfig+' ' : rulesConfig;
            if(ruleKeys.includes(el)){
                rulesConfig += `<<${el}>>`;
                let findAct = rulesAction.find(act=> act.id === rulesJson[el]['action']);
                let json = {
                    ...rulesJson[el],
                    action: findAct.name,
                    operator: operators[rulesJson[el]['operator']]
                }
                delete json.action_variable;
                return Object.values(json).join(' ');
            } else {
                rulesConfig += el;
                return el;
            }
        });
        let statement = finalArry.join(' ');
        setHelpertext(statement);
        setRulesCreate(rulesConfig);
    }

    const handleSetRewards = (e) => {
        let str = e.target.value;
        if(isNaN(str)){
            return;
        }
        str = str.replace(/\s/g, '');
        setMembershipRewards(str);
    }

    const handleFormSubmit = () => {
        if(membershipName === '') {
            dispatch(showMessage({ variant: 'error', message: 'Please add membership name!' }));
            return;
        }
        if(monetoryBenefit){
            if(membershipRewards === 0 || !membershipRewards) {
                dispatch(showMessage({ variant: 'error', message: 'Please enter '+(rewardsType ? 'cash': 'points')+'!' }));
                return;
            }
        }
        if(rulesCreate === ''){
            dispatch(showMessage({ variant: 'error', message: 'Rules configuration is empty!' }));
            return;
        }
        
        const params = new FormData();
        params.append('name', membershipName);
        params.append('logo', membershipLogo);
        if(monetoryBenefit) {
            params.append('cash', rewardsType ? membershipRewards : 0 );
            params.append('points', !rewardsType ? membershipRewards : 0 )
        }
        else {
            params.append('cash', 0);
            params.append('points', 0);
        }
        params.append('configuration', JSON.stringify({
            rules_used: rulesJson,
            rules_config: rulesCreate,
            rules_statement: helpertext
        }));

        setLoading(true);
        const endPoint = (moduleId !== 'create' && !isNaN(moduleId)) ? jwtServiceConfig.membershipUpdate + `/${moduleId}` : jwtServiceConfig.membershipSave;
        axios.post(endPoint, params)
            .then((response) => {
                setLoading(false);
                if (response.data.results.status) {                 
                    dispatch(showMessage({ variant: 'success', message: response.data.results.message }));
                    navigate(`/app/membership-tiers`);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }))
                }
            })
            .catch((error) => {
                console.log(error)
                setLoading(false)
                dispatch(showMessage({ variant: 'error', message: 'Something went wrong!' }))
            })
    }

    useEffect(()=>{
        if(moduleId !== 'create' && !isNaN(moduleId)){
            getSingleRecordById();
        } else {
            getActionsData();
        }
    }, []);

    const convertExpressionToRule = (expression, rules, rulesAction) =>{
        let arry = expression.split(' ');
        let statementArry = arry.map(r=>{
            let findAct = rulesAction.find(act=> act.variable === r);
            if(findAct !== undefined){
                let indx = rules.findIndex(row=> row.membership_tier_action_id === findAct.id);
                if(indx !== -1){                    
                    return 'Rule'+(indx+1);
                }
            } else {
                return r;
            }
        });
        setRulesStatement(statementArry);
    }

    const getSingleRecordById = () => {
        axios.get(jwtServiceConfig.membershipEdit + `/${moduleId}`)
            .then((response) => {
                if (response.data.results.result) {
                    const record = response.data.results.result;
                    let preparedRules = {}
                    record.rules.map((r,i)=>{
                        preparedRules['Rule'+(i+1)] = {
                            action: r.membership_tier_action_id,
                            operator: r.operator,
                            value: r.value
                        }
                        let act = record.rule_actions.find(act=> act.id === r.membership_tier_action_id);
                        preparedRules['Rule'+(i+1)]['action_variable'] = act.variable;
                    });
                    if(!record.reward_cash && !record.reward_point){
                        setMonetoryBenefit(false);
                    } else {
                        setMonetoryBenefit(true);
                        if(record.reward_cash){
                            setMembershipRewards(record.reward_cash);
                            setRewardsType(true);
                        } else {
                            setRewardsType(false);
                            setMembershipRewards(record.reward_point);
                        }
                    }
                    setLogo(record.logo);
                    setRulesAction(record.rule_actions);
                    setMembershipName(record.name);
                    setRulesJson(preparedRules);
                    convertExpressionToRule(record.MemberShipTierRule.config_json.rule_config, record.rules, record.rule_actions);
                    setHelpertext(record.MemberShipTierRule.config_json.rule_statement);
                } else {
                    dispatch(showMessage({ variant: 'error', message: response.data.results.message }));
                }
            })
            .catch((error) => {
                console.log(error)
                dispatch(showMessage({ variant: 'error', message: error.response.data.errors }))
            })
    }

    const handleClearRulesConfig = () => {
        handleRulesCreate('');
        setHelpertext('');
        setLogicalOperator('');
        setSelectRules('');
        setSymbol('');
        setRulesStatement([]);
    }
    
    const handleRuleConfigDelete = () => {
        rulesStatement.pop();
        setRulesStatement([...rulesStatement]);
    }
    return (
        <FusePageCardSimple
            header={
                <MainHeader module="Membership Tier" backUrl="/app/membership-tiers" />
            }
            content={
                <>
                    <div className="mb-10 w-full p-20">
                        <Accordion expanded={expanded.includes('panel1')} onChange={handleChange('panel1')}>
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
                                            value={membershipName}
                                            onChange={(e)=>setMembershipName(e.target.value)}
                                        />
                                    </FormControl> 
                                    <FormControl className="w-1/2 mb-10">
                                        <FormControlLabel control={<Switch checked={monetoryBenefit} onChange={()=>setMonetoryBenefit(!monetoryBenefit)} />} label="Do you want to add monetary benefit?" />
                                    </FormControl>
                                    {
                                        monetoryBenefit && (
                                            <FormControl className="w-1/2 mb-10">
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography>Points</Typography>
                                                    <Switch className="switch" checked={rewardsType} onChange={handleSetRewardsType}  name="rewards_type" />
                                                    <Typography>Cash</Typography>
                                                </Stack>
                                                {
                                                    rewardsType ? (
                                                        <TextField
                                                            type="tel"
                                                            id="outlined-required"
                                                            label="Cash"
                                                            onChange={handleSetRewards}
                                                            value={rewardsType ? membershipRewards : 0}
                                                        />
                                                    ) : (
                                                        <TextField
                                                            type="tel"
                                                            id="outlined-required"
                                                            label="Points"
                                                            onChange={handleSetRewards}
                                                            value={!rewardsType ? membershipRewards : 0}
                                                        />
                                                    )
                                                }
                                            </FormControl>
                                        )
                                    }
                                    <FormControl className="w-1/2 mb-10">
                                        <TextField
                                            required
                                            id="outlined-required"
                                            type="file"
                                            onChange={(e)=>setMembershipLogo(e.target.files[0])}
                                        />
                                    </FormControl>
                                    {
                                        logo && (
                                            <div className='mt-10 text-center w-1/2'>
                                                <img
                                                    src={logo}
                                                    srcSet={`${logo}?w=50&h=50&fit=crop&auto=format&dpr=2 2x`}
                                                    loading="lazy"
                                                    width={200}
                                                />
                                            </div>
                                        )
                                    }                                    
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded.includes('panel2')} onChange={handleChange('panel2')}>
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
                                <div className='flex items-center mb-32'>
                                    <FormControl className="w-4/6" sx={{'& .MuiInputBase-formControl': {borderTopRightRadius: 0, borderBottomRightRadius: 0}}}>
                                        <TextField
                                            sx={{'& .MuiFormHelperText-sizeMedium': {position: 'absolute', top: '100%', width: '100%'}}}
                                            required
                                            id="outlined-required"
                                            label="Rule Configuration"
                                            onChange={(e)=>handleRulesCreate(e.target.value)}
                                            value={rulesCreate}
                                            InputProps={{
                                                readOnly: true,
                                                ...rulesCreate !== '' ? {
                                                    endAdornment :(
                                                        <InputAdornment position="end">
                                                            <Tooltip placement="top" title="Delete">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    edge="end"
                                                                    onClick={handleRuleConfigDelete}
                                                                >
                                                                    <FuseSvgIcon className="text-48" size={24} color="action">material-outline:arrow_back</FuseSvgIcon>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </InputAdornment>
                                                    )
                                                }: ''
                                            }}
                                            helperText={
                                                rulesCreate !== '' ? (
                                                    <span className='cursor-pointer' onClick={handleClearRulesConfig}>Clear Rule</span>
                                                ) : ''
                                            }
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
                                                Object.keys(rulesJson).length && Object.keys(rulesJson).sort().map(el => {
                                                    return (rulesJson[el].action && rulesJson[el].operator) ? <MenuItem key={el} value={el}>{el}</MenuItem> : ''
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
                                            {
                                                Object.keys(logicalOp).map(el=>{
                                                    return <MenuItem key={el} value={el}>{logicalOp[el]}</MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl className="w-1/6  bg-gray-300" sx={{'& .MuiInputBase-formControl': {borderRadius: 0}}}>
                                        <InputLabel id="action-select-label">Symbols</InputLabel>
                                        <Select
                                            labelId="action-select-label"
                                            id="action-select"
                                            value={symbol}
                                            label="Operator"
                                            onChange={handleSymbol}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value="(">(</MenuItem>
                                            <MenuItem value=")">)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                {helpertext && <p><strong>Statement: <em>{helpertext}</em></strong></p>}
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
                                {moduleId === 'create' ? 'Save' : 'Update'}
                            </LoadingButton>
                            <Button
                                className="whitespace-nowrap mx-4"
                                variant="contained"
                                color="error"
                                onClick={()=>navigate('/app/membership-tiers')}
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