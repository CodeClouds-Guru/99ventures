import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

function usePermission(module) {
    module = module.replaceAll('-', '')
    const types = ['all', 'group', 'owner'];
    const userPermissions = useSelector(state => state.user.permissions);
    const hasPermission = (action, type = 'all') => {
        let permission = `${type}-${module}-${action}`;
        return userPermissions.includes(permission);
    };
    return {
        hasPermission
    }
}

export default usePermission;