import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDeepCompareEffect } from '@fuse/hooks';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import withReducer from 'app/store/withReducer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { getModule, resetModule, selectModule, getModuleFields } from '../store/moduleSlice';
import reducer from '../store';
import CreateEditHeader from './CreateEditHeader';
import CreateEditForm from './CreateEditForm';
import Alert from '@mui/material/Alert';
import PermissionGrid from './components/PermissionGrid';

function CreateEdit(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const moduleData = useSelector(selectModule);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const errors = useSelector(state => state.crud.module.errors)

  const routeParams = useParams();
  const { module } = routeParams;
  const [tabValue, setTabValue] = useState(0);
  const [noModule, setNoModule] = useState(false);

  const { moduleId } = routeParams;

  useEffect(() => {
    function updateModuleState() {

      if (moduleId === 'create') {
        dispatch(getModuleFields({ module }));
      } else {
        dispatch(getModule({ moduleId, module })).then((action) => {
          if (!action.payload) {
            setNoModule(true);
          }
        });
      }
    }
    updateModuleState();
  }, [dispatch, routeParams]);



  useEffect(() => {
    return () => {
      dispatch(resetModule());
      setNoModule(false);
    };
  }, [dispatch]);



  /**
   * Show Message if the requested module is not exists
   */
  if (noModule) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          There is no such {module}!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to={`/app/${module}`}
          color="inherit"
        >
          Go to {module} Page
        </Button>
      </motion.div>
    );
  }

  /**
   * Wait while product data is loading and form is settled
   */
  if (
    (moduleData && routeParams.moduleId != moduleData.id && routeParams.moduleId !== 'create')
  ) {
    return <FuseLoading />;
  }

  let moduleOnSaveHandler = (genModuleId) => {
    let url = `/app/${module}`;
    if (['roles'].includes(module)) {
      url = `/app/${module}/${genModuleId}`;
    }
    navigate(url);
  }

  const createForm = () => { }

  return (
    <FusePageCarded
      header={<CreateEditHeader />}
      content={
        <>
          <div className={`p-16 sm:p-24 ${module === 'email-templates' ? 'w-full' : 'max-w-3xl'}`} >
            {errors && <Alert severity="error">{errors}</Alert>}
            <CreateEditForm moduleOnSave={moduleOnSaveHandler} />
          </div>
          {(module === 'roles' && moduleId !== 'create') ? <PermissionGrid roleId={moduleId} /> : ''}
        </>
      }
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default withReducer('crud', reducer)(CreateEdit);
