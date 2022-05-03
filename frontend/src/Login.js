import React from 'react';
import {Navigate} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";

export function Login(){
    const client = useQueryClient()
    const random_str = generateRandomHex(10)

    /**
     * What's sent: secret_string is sent to database to check for later
     * Expected return:
     *  {client_id: client_id,
     *   state: state}
     */

    let req = new Request('http://localhost:8000/start_auth/', {
        method: 'POST',
        body: JSON.stringify({'state': random_str}),
        redirect: "follow"
    });


    const {isLoading, isError, data, error} = useQuery(["setString"], async () => {
        const response = await fetch(req)
        return response.json()
    }, { refetchOnWindowFocus: false, retry: false})

    console.log(data)

    if(isLoading){
        return <h3>Redirecting...</h3>
    } if (isError) {
        return <div><h3>Something wrong happened.</h3> <p>{error}</p></div>
    } if (data) {
        window.location.href = "https://todoist.com/oauth/authorize?client_id=" + data.client_id +
            "&scope=data:read_write&state=" + data.state;
        return null;

    } else {
        return null;
    }
}

export function Logout(){
    localStorage.removeItem("token")
    window.location.reload();
    return <Navigate to="/"/>
}

const generateRandomHex = (length) => {
    const randomNumber = Math.random().toString(16);
    return randomNumber.substr(2, length);
};