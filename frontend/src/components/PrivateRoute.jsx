import React from 'react'
import { useSelector } from 'react-redux';
import { Outlet , Navigate } from 'react-router-dom';


export default function PrivateRoute() {

    const { currentUser, sessionExpiry } = useSelector((state) => state.user);
    const isExpired = sessionExpiry && Date.now() >= sessionExpiry;

  return currentUser && !isExpired ? <Outlet /> : <Navigate to='/sign-in' />;          // outlet will be pointing to the children of PrivateRote , i.e , dashboard
}