import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDispatch, useSelector } from 'react-redux';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import Header from 'app/shared-components/Header';
import FormField from './FormField';

function Index(props) {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const module = 'Settings'



    return (
        <FusePageCarded
            header={
                <Header module={module} slug="settings" />
            }
            content={
                <FormField />
            }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default Index;
