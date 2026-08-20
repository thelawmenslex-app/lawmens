import { combineReducers } from 'redux'
import helperReducer from './helper';
import profileReducer from './profile';

const rootReducer = combineReducers({
    helper: helperReducer,
    profile: profileReducer,

})
export default rootReducer;