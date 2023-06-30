import FusePageCarded from '@fuse/core/FusePageCarded';
import { Link, useParams } from 'react-router-dom';
import _ from '@lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CreateEditForm from './CreateEditForm';
import MainHeader from '../../../shared-components/MainHeader'

function CreateEdit(props) {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { moduleId } = useParams();

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
