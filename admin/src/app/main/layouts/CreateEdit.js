import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import MainHeader from 'app/shared-components/MainHeader';
import CreateEditForm from './CreateEditForm';

const CreateEdit = () => {
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const module = 'Layouts'

    return (
        <FusePageCarded
            className="sm:px-20"
            header={
                <MainHeader module={module} slug="settings" />
            }
            content={
                <CreateEditForm />
            }
            scroll={isMobile ? 'normal' : 'content'}
        />
    );
}

export default CreateEdit;

