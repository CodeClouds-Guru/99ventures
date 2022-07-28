import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
// import reducer from '../store';
import ListHeader from './ListHeader';
import ListTable from './ListTable';

function List() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <FusePageCarded
      header={<ListHeader />}
      content={<ListTable />}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

// export default withReducer('eCommerceApp', reducer)(List);
export default List;