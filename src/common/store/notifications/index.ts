import {Dispatch} from "redux";

import {ActionTypes as ActiveUserActionTypes} from "../active-user/types"

import {
    Actions,
    ActionTypes,
    ApiNotification,
    FetchAction,
    FetchedAction,
    FetchErrorAction,
    NFetchMode,
    NotificationFilter,
    Notifications,
    SetFilterAction,
    SetUnreadCountAction
} from "./types";

import {AppState} from "../index";

import {getNotifications, getUnreadNotificationCount} from "../../api/private";

export const initialState: Notifications = {
    filter: null,
    unread: 0,
    list: [],
    loading: false,
    error: false,
    hasMore: true
};

export default (state: Notifications = initialState, action: Actions): Notifications => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            switch (action.mode) {
                case NFetchMode.APPEND:
                    return {
                        ...state,
                        loading: true,
                    };
                case NFetchMode.REPLACE:
                    return {
                        ...state,
                        list: [],
                        loading: true,
                    };
                default:
                    return state;
            }
        }
        case ActionTypes.FETCHED: {
            const {list} = state;
            let newList: ApiNotification[] = []

            switch (action.mode) {
                case NFetchMode.APPEND:
                    newList = [...list, ...action.list];
                    break;
                case NFetchMode.REPLACE:
                    newList = [...action.list];
                    break;
            }

            return {
                ...state,
                loading: false,
                error: false,
                list: newList,
                hasMore: action.list.length !== 0
            };
        }
        case ActionTypes.FETCH_ERROR: {
            return {
                ...state,
                loading: false,
                error: true
            };
        }
        case ActiveUserActionTypes.LOGIN:
        case ActiveUserActionTypes.LOGOUT: {
            return {...initialState}
        }
        case ActionTypes.SET_FILTER: {
            return {
                ...state,
                list: [],
                hasMore: true,
                filter: action.filter
            };
        }
        case ActionTypes.SET_UNREAD_COUNT: {
            return {
                ...state,
                unread: action.count
            };
        }
        default:
            return state;
    }
}

/* Actions */
export const fetchNotifications = (since: number | null = null) => (dispatch: Dispatch, getState: () => AppState) => {

    if (since) {
        dispatch(fetchAct(NFetchMode.APPEND));
    } else {
        dispatch(fetchAct(NFetchMode.REPLACE));
    }

    const {notifications, activeUser, users} = getState();

    const {filter} = notifications;

    const user = users.find((x) => x.username === activeUser?.username)!;

    getNotifications(user, filter, since).then(r => {

        if (since) {
            dispatch(fetchedAct(r, NFetchMode.APPEND));
        } else {
            dispatch(fetchedAct(r, NFetchMode.REPLACE));
        }

    }).catch(() => {
        dispatch(fetchErrorAct());
    });
}
export const fetchUnreadNotificationCount = () => (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser, users} = getState();

    const user = users.find((x) => x.username === activeUser?.username)!;

    getUnreadNotificationCount(user).then(count => {
        dispatch(setUnreadCountAct(count));
    })
}

export const setNotificationsFilter = (filter: NotificationFilter | null) => (dispatch: Dispatch) => {
    dispatch(setFilterAct(filter));
}

/* Action Creators */
export const fetchAct = (mode: NFetchMode): FetchAction => {
    return {
        type: ActionTypes.FETCH,
        mode
    };
};

export const fetchedAct = (list: ApiNotification[], mode: NFetchMode): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        list,
        mode
    };
};

export const fetchErrorAct = (): FetchErrorAction => {
    return {
        type: ActionTypes.FETCH_ERROR,
    };
};

export const setFilterAct = (filter: NotificationFilter | null): SetFilterAction => {
    return {
        type: ActionTypes.SET_FILTER,
        filter
    };
};

export const setUnreadCountAct = (count: number): SetUnreadCountAction => {
    return {
        type: ActionTypes.SET_UNREAD_COUNT,
        count
    };
};
