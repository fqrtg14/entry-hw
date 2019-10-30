import { Middleware, AnyAction } from 'redux';
import { Dispatch } from 'react';
import { IStoreState } from '../index';
import {
    CATEGORY_CHANGED,
    changeHardwareList,
    HARDWARE_LIST_RESET,
    HARDWARE_SEARCH_KEYWORD_CHANGED,
    HARDWARE_SELECTED,
} from '../modules/hardware';
import filterHardwareList from '../../functions/filterHardware';
import { CURRENT_STATE_CHANGED } from '../modules/common';
import { HardwarePageStateEnum } from '../../constants/constants';

const { translator, rendererRouter } = window;

/**
 * RendererRouter 의 ipc 통신 로직을 담당한다.
 * 리액트 엘리먼트에서는 뷰 전환에 관련한 로직만 생각하고, 여기서는 메인프로세스와의 통신만을 다룬다.
 */
const entryHardwareMiddleware: Middleware = ({ getState }: { getState: () => IStoreState }) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    const { type } = action; // currentAction

    switch (type) {
        case CATEGORY_CHANGED: {
            next(action);
            const { hardware } = getState();
            const { hardwareFilterKeyword, hardwareFilterCategory } = hardware;
            const hardwareList = filterHardwareList(hardwareFilterKeyword, hardwareFilterCategory, rendererRouter.hardwareList);
            changeHardwareList(next)(hardwareList);
            break;
        }
        case HARDWARE_SEARCH_KEYWORD_CHANGED: {
            const { hardware } = getState();
            const { hardwareFilterCategory } = hardware;
            const { payload: keyword } = action;
            const hardwareList = filterHardwareList(keyword, hardwareFilterCategory, rendererRouter.hardwareList);

            if (!hardwareList || hardwareList.length === 0) {
                alert(translator.translate('No results found'));
            } else {
                changeHardwareList(next)(hardwareList);
                next(action);
            }
            break;
        }
        case CURRENT_STATE_CHANGED: {
            const { payload: nextState } = action;
            if (nextState === HardwarePageStateEnum.list) {
                rendererRouter.stopScan();
            }
            next(action);
            break;
        }
        case HARDWARE_SELECTED: {
            const { payload: hardware } = action;
            // noinspection JSIgnoredPromiseFromCall
            rendererRouter.startScan(hardware);
            next(action);
            break;
        }
        case HARDWARE_LIST_RESET: {
            changeHardwareList(next)(rendererRouter.hardwareList);
            break;
        }
        default:
            next(action);
    }
};

export default entryHardwareMiddleware; // 불러와서 사용 할 수 있도록 내보내줍니다.
