import React from 'react'
import { useParams } from 'react-router-dom'
import List from './list/List'
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

function ListPage() {
  const { module } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  return <FusePageCarded
    content={
      <>
        <List module={module} />
        {/* <br /><br /><br />
        <List module="roles"/> */}
      </>
    }
    scroll={isMobile ? 'normal' : 'page'}
  />
}

export default ListPage