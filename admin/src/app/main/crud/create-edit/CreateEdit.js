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
import { Link, useParams } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { getModule, newProduct, resetProduct, selectModule, getModuleFields } from '../store/moduleSlice';
import reducer from '../store';
import CreateEditHeader from './CreateEditHeader';
import CreateEditForm from './CreateEditForm';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup
    .string()
    .required('You must enter a product name')
    .min(5, 'The product name must be at least 5 characters'),
});

function CreateEdit(props) {
  const dispatch = useDispatch();
  const moduleData = useSelector(selectModule);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const routeParams = useParams();
  const { module } = routeParams;
  const [tabValue, setTabValue] = useState(0);
  const [noProduct, setNoProduct] = useState(false);


  useDeepCompareEffect(() => {
    function updateProductState() {
      const { moduleId } = routeParams;

      if (moduleId === 'create') {
        /**
         * Create New Product data
         */
        dispatch(getModuleFields({ module }));
      } else {
        /**
         * Get Product data
         */
        dispatch(getModule({ moduleId, module })).then((action) => {
          /**
           * If the requested product is not exist show message
           */
          if (!action.payload) {
            setNoProduct(true);
          }
        });
      }
    }

    updateProductState();
  }, [dispatch, routeParams]);



  useEffect(() => {
    return () => {
      /**
       * Reset Product on component unload
       */
      dispatch(resetProduct());
      setNoProduct(false);
    };
  }, [dispatch]);

  /**
   * Tab Change
   */
  function handleTabChange(event, value) {
    setTabValue(value);
  }

  /**
   * Show Message if the requested products is not exists
   */
  if (noProduct) {
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
          to="/apps/e-commerce/products"
          color="inherit"
        >
          Go to Products Page
        </Button>
      </motion.div>
    );
  }

  /**
   * Wait while product data is loading and form is setted
   */
  // if (
  //   _.isEmpty(form) ||
  //   (product && routeParams.moduleId !== product.id && routeParams.moduleId !== 'create')
  // ) {
  //   return <FuseLoading />;
  // }

  return (
    <FusePageCarded
      header={<CreateEditHeader />}
      content={
        <>
          <div className="p-16 sm:p-24 max-w-3xl">
            <CreateEditForm />
          </div>
        </>
      }
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default withReducer('crud', reducer)(CreateEdit);
