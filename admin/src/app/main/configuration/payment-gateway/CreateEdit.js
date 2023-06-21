import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDeepCompareEffect } from '@fuse/hooks';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import withReducer from 'app/store/withReducer';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import _ from '@lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CreateEditForm from './CreateEditForm';
import MainHeader from '../../../shared-components/MainHeader'

function CreateEdit(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const module = 'paymentconfigurations';
  const [noModule, setNoModule] = useState(false);

  const { moduleId } = useParams();


  useEffect(() => {
    return () => {
    //   dispatch(resetModule());
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
//   if (
//     (moduleData && routeParams.moduleId != moduleData.id && routeParams.moduleId !== 'create')
//   ) {
//     return <FuseLoading />;
//   }

  let moduleOnSaveHandler = (genModuleId) => {
    let url = `/app/${module}`;
    if (['roles'].includes(module)) {
      url = `/app/${module}/${genModuleId}`;
    }
    navigate(url);
  }

  return (
    <FusePageCarded
      header={
        <MainHeader module={'Payment Gateway'} backUrl="/configuration?tab=paymentconfigurations" moduleId={moduleId} />
      }
      content={
        <>
            <div>
                <div className='w-full p-32'>
                    <CreateEditForm />
                </div>
            </div>
        </>
      }
      // scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default CreateEdit;
