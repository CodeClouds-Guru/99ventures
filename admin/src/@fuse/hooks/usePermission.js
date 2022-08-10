import { useCallback, useState } from "react";

function usePermission(module) {
    const types = ['all', 'group', 'owner'];
    const userPermissions = ['all-users-add', 'all-users-list', 'all-users-save', 'all-users-update', 'all-users-delete'];
    const hasPermission = (action, type = 'all') => {
        let permission = `${type}-${module}-${action}`;
        return userPermissions.includes(permission);
    };
    return {
        hasPermission
    }
}

export default usePermission;