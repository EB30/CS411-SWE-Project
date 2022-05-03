import {useQuery} from "react-query";
import React, {useState} from "react";
import * as Yup from 'yup';
import {isAuth} from "./index";
import {Field, Form, Formik, useFormik} from "formik";
import {Box, Button, TextField} from "@mui/material";

const ReviewSchema = Yup.object().shape({
    anonymous: Yup.boolean(),
    username: Yup.string().when("anonymous", {
        is: false, then: Yup.string().min(3, 'Too short!').max(25, "Too long!").required()
    }),
    review: Yup.string().min(10, 'Too short!').required()
})

export default function Reviews({recipe_id}) {

    async function handleSubmit(values) {
        await fetch("http://localhost:8000/add_review/", {
            method: "POST",
            body: JSON.stringify({
                // token: localStorage.getItem("token"),
                username: values.username,
                recipe_id: recipe_id,
                review: values.review
            })
        }).then(r => r.json())
    }

    const {isLoading, isError, data, error} = useQuery(["getReviews", recipe_id], async () => {
        const response = await fetch("http://localhost:8000/get_reviews/" + recipe_id)
        return response.json()
    }, {refetchOnWindowFocus: false})

    const formik = useFormik({
        initialValues: {username: "", anonymous: false, review: ""},
        validationSchema: ReviewSchema,
        onSubmit: async (values) => {
            await handleSubmit(values)
            window.location.reload()
        }});

    return(
        <div>
            <h2>Reviews</h2>
            {isAuth() ? <Box sx={{mx: 5, px: 5}}>
                <form onSubmit={formik.handleSubmit}>
                    <TextField name="username" id="username" label="Submit as..." variant="standard"
                               error={formik.touched.username && Boolean(formik.errors.username)}
                               InputLabelProps={{ style: {color: 'white'}}}
                               sx={{input: {color: 'white'}}}
                               value={formik.values.username}
                               onChange={formik.handleChange}
                               helperText={formik.touched.username && formik.errors.username}/>
                    <br/><br/>
                    <TextField multiline={true} size="medium" fullWidth rows={3} variant="filled"
                               name="review" id="review" label="Review"
                               error={formik.touched.review && Boolean(formik.errors.review)}
                               InputLabelProps={{ style: {color: 'white'}}}
                               InputProps={{style: {color: "white"}}}
                               sx={{input: {color: 'white'}}}
                               values={formik.values.review}
                               onChange={formik.handleChange}
                               helperText={formik.touched.review && formik.errors.review}/>
                    <Button variant="contained" type="submit">Submit Review</Button>
                </form>
            </Box> : <h6>You must be signed in to post a review.</h6>}

            <br/>

            {isLoading ? <p> Loading reviews... </p> : null}
            {isError ? <p>An error occurred!</p> : null}
            {data && data.reviews ? <div>
                {data.reviews.map((review, index) => (
                    <Box sx={{mx: 'auto', p: 2, width: "75%"}}>
                        <h3>{review.username}</h3>
                        <p>{review.review}</p>
                    </Box>))}
            </div> : <h5>Be the first to review this recipe!</h5>}
        </div>
    )



}