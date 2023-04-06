import FuseNavigation from '@fuse/core/FuseNavigation';
import clsx from 'clsx';
import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNavigation, removeNavigationItem, resetNavigation } from 'app/store/fuse/navigationSlice';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { navbarCloseMobile } from 'app/store/fuse/navbarSlice';
import { usePermission } from '@fuse/hooks';
import { indexof } from 'stylis';

function Navigation(props) {
  const navigation = useSelector(selectNavigation);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const userPermissions = useSelector(state => state.user.permissions);

  const dispatch = useDispatch();
  useEffect(() => {
    navigation.filter(n => !['dashboard', 'configuration', 'administration', 'pagesAndLayouts', 'shoutboxMenu'].includes(n.id))
      .map(nav => {
        let permissions = [];
        let allowedPermissions;
        if ('children' in nav) {
          nav.children.map(cnav => {
            permissions = [
              `all-${cnav.id}-navigation`,
              `group-${cnav.id}-navigation`,
              `owner-${cnav.id}-navigation`
            ];
            allowedPermissions = permissions.filter(p => userPermissions.includes(p));
            if (allowedPermissions.length == 0) {
              dispatch(removeNavigationItem(cnav.id));
            }
          })
        } else {
          permissions = [
            `all-${nav.id}-navigation`,
            `group-${nav.id}-navigation`,
            `owner-${nav.id}-navigation`
          ];
          allowedPermissions = permissions.filter(p => userPermissions.includes(p));
          if (allowedPermissions.length == 0) {
            dispatch(removeNavigationItem(nav.id));
          }
        }
      }
      )
  }, [userPermissions])

  return useMemo(() => {
    function handleItemClick(item) {
      if (isMobile) {
        dispatch(navbarCloseMobile());
      }
    }

    return (
      <FuseNavigation
        className={clsx('navigation', props.className)}
        navigation={navigation}
        layout={props.layout}
        dense={props.dense}
        active={props.active}
        onItemClick={handleItemClick}
      />
    );
  }, [dispatch, isMobile, navigation, props.active, props.className, props.dense, props.layout]);
}

Navigation.defaultProps = {
  layout: 'vertical',
};

export default memo(Navigation);
