import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import navigationConfig from 'app/configs/navigationConfig';
import FuseUtils from '@fuse/utils';
import i18next from 'i18next';
import _ from '@lodash';
import { usePermission } from '@fuse/hooks';


const navigationAdapter = createEntityAdapter();
const emptyInitialState = navigationAdapter.getInitialState();
const initialState = navigationAdapter.upsertMany(emptyInitialState, navigationConfig);

export const appendNavigationItem = (item, parentId) => (dispatch, getState) => {
	const navigation = selectNavigationAll(getState());

	return dispatch(setNavigation(FuseUtils.appendNavItem(navigation, item, parentId)));
};

export const prependNavigationItem = (item, parentId) => (dispatch, getState) => {
	const navigation = selectNavigationAll(getState());

	return dispatch(setNavigation(FuseUtils.prependNavItem(navigation, item, parentId)));
};

export const updateNavigationItem = (id, item) => (dispatch, getState) => {
	const navigation = selectNavigationAll(getState());

	return dispatch(setNavigation(FuseUtils.updateNavItem(navigation, id, item)));
};

export const removeNavigationItem = (id) => (dispatch, getState) => {
	const navigation = selectNavigationAll(getState());

	return dispatch(setNavigation(FuseUtils.removeNavItem(navigation, id)));
};

export const {
	selectAll: selectNavigationAll,
	selectIds: selectNavigationIds,
	selectById: selectNavigationItemById,
} = navigationAdapter.getSelectors((state) => state.fuse.navigation);

const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		setNavigation: navigationAdapter.setAll,
		resetNavigation: (state, action) => initialState,
	},
});

export const { setNavigation, resetNavigation } = navigationSlice.actions;

const getUserRole = (state) => state.user.role;
const getUserPermissions = (state) => state.user.permissions;
const unreadTicketCount = (state) => state.user.unread_tickets;

export const selectNavigation = createSelector(
	[selectNavigationAll, ({ i18n }) => i18n.language, getUserRole, unreadTicketCount, getUserPermissions],
	(navigation, language, userRole, unreadTicketCount, userPermissions) => {

		/*** This area is related to permission checking ***/
		const filterNav = [];		
		navigation.map(el => {	
			if(el.id === 'dashboard') {
				filterNav.push(el);
			}
			else if(el.children) {
				const childNav = [];
				el.children.map(ch => {
					if(checkPermission(ch.id, userPermissions)) {
						childNav.push(ch)
					}
				});
				if (childNav.length) {
					filterNav.push({ ...el, children: childNav })
				}
			}
			else if(el.depends_on){
				const childNav = [];
				el.depends_on.map(dp => {
					if(checkPermission(dp.id, userPermissions)) {
						childNav.push(dp)
					}
				});
				if (childNav.length) {
					filterNav.push({ ...el, children: childNav })
				}
			}
			else if(checkPermission(el.id, userPermissions)){
				filterNav.push(el)
			}
		});
		/*** Permission checking end ***/

		function setTranslationValues(data) {
			// loop through every object in the array
			return data.map((item) => {
				if (item.id === 'tickets') {
					if (unreadTicketCount > 0) {
						item.badge.title = unreadTicketCount
					} else {
						delete item.badge
					}
				}
				if (item.translate && item.title) {
					item.title = i18next.t(`navigation:${item.translate}`);
				}

				// see if there is a children node
				if (item.children) {
					// run this function recursively on the children array
					item.children = setTranslationValues(item.children);
				}
				return item;
			});
		}
		return setTranslationValues(
			_.merge(
				[],
				filterRecursively(filterNav, (item) => FuseUtils.hasPermission(item.auth, userRole))
			)
		);
	}
);

function filterRecursively(arr, predicate) {
	return arr.filter(predicate).map((item) => {
		item = { ...item };
		if (item.children) {
			item.children = filterRecursively(item.children, predicate);
		}
		return item;
	});
}

function checkPermission(module, permissions) {
	let permission = `all-${module}-view`;
    return permissions.includes(permission);
}

export const selectFlatNavigation = createSelector([selectNavigation], (navigation) =>
	FuseUtils.getFlatNavigation(navigation)
);

export default navigationSlice.reducer;
