import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDispatch, useSelector } from 'react-redux';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import FormField from './FormField';

function Index(props) {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const module = 'Settings'



    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="settings" />
            }
            content={
                <FormField />
            }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default Index;
