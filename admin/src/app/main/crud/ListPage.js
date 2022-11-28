import React from 'react'
import { useParams } from 'react-router-dom'
import List from './list/List'
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { usePermission } from '@fuse/hooks';
import Listing from '../members/listing/Listing';

function ListPage() {
  const { module } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { hasPermission } = usePermission(module);
  return <FusePageCarded
    content={
      <>{module === 'members' ?
        <Listing module='members'
          editable={hasPermission('update')}
          addable={hasPermission('save')}
          deletable={hasPermission('delete')}
        /> :
        <List module={module}
          editable={hasPermission('update')}
          addable={hasPermission('save')}
          deletable={hasPermission('delete')}
        />}
        {/* <br /><br /><br />
        <List module="roles"/> */}
      </>
    }
    scroll={isMobile ? 'normal' : 'page'}
  />
}

export default ListPage