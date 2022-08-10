import { selectUserPermissions } from "app/store/userSlice";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

function usePermission(module) {
    const types = ['all', 'group', 'owner'];
    const userPermissions = useSelector(selectUserPermissions);
    const hasPermission = (action, type = 'all') => {
        let permission = `${type}-${module}-${action}`;
        return userPermissions.includes(permission);
    };
    return {
        hasPermission
    }
}

export default usePermission;