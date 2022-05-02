import {useQuery} from "react-query";
import React, {useState} from "react";
import * as Yup from 'yup';
import {isAuth} from "./index";
import {Field, Form, Formik} from "formik";
import {Box, Button, TextField} from "@mui/material";


export default function Reviews({recipe_id}){

    const [review, setReview] = useState("");
    const [username, setUsername] = useState("");
    const [submit, setSubmit] = useState(false);

    const ReviewSchema = Yup.object().shape({
        anonymous: Yup.boolean(),
        username: Yup.string().when("anonymous", {
            is: false, then: Yup.string().min(3, 'Too short!').max(25, "Too long!").required("Required!")
        }),
        review: Yup.string().min(10, 'Too short!').required('Required')
    })

    const handleSubmit = () => {
        const {isLoading, isError, data, error} = useQuery(["addReview", username, recipe_id], async () => {
        const response = await fetch("http://localhost:8000/add_review",
            {
                method: "POST",
                body: {
                    // token: localStorage.getItem("token"),
                    username: username,
                    recipe_id: recipe_id,
                    review: review
                }
            })
        }, {refetchOnWindowFocus: false, retry: false, enabled: submit})

        if(!isError && !isLoading){
            window.location.reload();
        } if(isError) {
            console.log(error)
        }

    }

    const {isLoading, isError, data, error} = useQuery(["getReviews", recipe_id], async () => {
        const response = await fetch("http://localhost:8000/get_reviews/" + recipe_id)
        return response.json()
    })

    return(
        <div>
            {isAuth() ? <div>
                <Formik initialValues={{username: "", anonymous: false, review: ""}}
                        validationSchema={ReviewSchema}
                        onSubmit={(values) => {
                            if (values.anonymous) {
                                setUsername("Anonymous")
                            } else {
                                setUsername(values.username)
                            }
                            handleSubmit()
                        }}>
                    {({errors, touched}) => (
                        <Form>
                            <TextField name="username" id="username" label="Submit as..." variant="standard"
                                       error={touched.username && Boolean(errors.username)}
                                       helperText={touched.username && errors.username}/>

                            Check box to submit as anonymous: <Field type="checkbox" name="anonymous"/> <br/>
                            <TextField multiline={true} size="medium" fullWidth rows={3} variant="filled"
                                       name="review" id="review" label="Email"
                                       error={Boolean(errors.review) && touched.review}
                                       helperText={touched.review && errors.review}/>
                            <Button variant="contained" type="submit">Submit Review</Button>
                        }
                        </Form>
                    )}
                </Formik>
            </div> : <h6>You must be signed in to post a review.</h6> }

            {isLoading ? <p> Loading reviews... </p> : null}
            {isError ? <p>An error occurred!</p> : null}
            {data ? <div><h2>Reviews</h2>
                data.reviews.map((review, index) => (
                    <Box>
                        <h3>{review.username}</h3><br/>
                        <p>{review.review}</p>
                    </Box>))
            </div> : null}
        </div>
    )



}