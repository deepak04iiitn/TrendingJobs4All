import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    currentUser: null,
    error: null,
    loading: false,
    sessionExpiry: null, // epoch ms when session should auto-expire
}

const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers : {                               // // here we add the logics for the functionalities we want
        signInStart : (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload; // user data is payload
            state.loading = false;
            state.error = null;
            // Set 1 hour expiry from now
            state.sessionExpiry = Date.now() + 60 * 60 * 1000;
        },
        signInFailure : (state , action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateStart : (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.currentUser = action.payload; // user data is payload
            state.loading = false;
            state.error = null;
        },
        updateFailure : (state , action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart : (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null; // removing the person
            state.loading = false;
            state.error = null;
            state.sessionExpiry = null;
        },
        deleteUserFailure : (state , action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signoutSuccess: (state) => {
            state.currentUser = null;
            state.error = null;
            state.loading = false;
            state.sessionExpiry = null;
        },
        // In case we need to initialize expiry when missing (e.g., after upgrade)
        initializeSessionExpiry: (state) => {
            if (state.currentUser && !state.sessionExpiry) {
                state.sessionExpiry = Date.now() + 60 * 60 * 1000;
            }
        }
    }
});

export const { signInFailure , signInStart , signInSuccess , updateStart , updateSuccess , updateFailure , 
    deleteUserStart , deleteUserSuccess , deleteUserFailure , signoutSuccess, initializeSessionExpiry
 } = userSlice.actions;

export default userSlice.reducer;