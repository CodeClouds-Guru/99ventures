import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { usePermission } from '@fuse/hooks';
import List from "../../crud/list/List";
 
const GatewayList = () => {
    const module = 'payment-configurations';
    const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
    const { hasPermission } = usePermission(module);
    
    return <FusePageCarded
        content={
            <>
                <List module={module}
                    editable={hasPermission('update')}
                    addable={hasPermission('save')}
                    deletable={hasPermission('delete')}
                />
            </>
        }
        scroll={isMobile ? 'normal' : 'page'}
    />
}

export default GatewayList;