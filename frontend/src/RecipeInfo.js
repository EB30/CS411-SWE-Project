import React, {useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useQuery} from "react-query";
import {Box, Button, Grid, Popover} from "@mui/material";
import parse from 'html-react-parser';
import {isAuth} from "./index";
import {Form, Formik, Field} from "formik";
import Reviews from "./Reviews";

export default function RecipeInfo(){
    const {recipe_id}= useParams();
    // console.log(recipe_id)
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { isLoading, isError, data, error } = useQuery(['getInfo', recipe_id], async () => {
        const response = await fetch("http://localhost:8000/information/" + recipe_id)
               return response.json()
            }, {refetchOnWindowFocus: false}
        )

    const handleClick = (event) => {
        setMenuOpen(true);
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setMenuOpen(false)
        setAnchorEl(null);
    };

    console.log(data)

    if(isLoading){
        return <div><h3>Loading recipe information...</h3></div>
    } if(isError || (data && data.status && data.status === "failure")) {
        return (<div><h3>Couldn't find recipe with that ID!</h3>
                <Link to="/">Back to main page?</Link></div>)
    } if(data) {

        console.log(data.analyzedInstructions[0])

        return (<Box sx={{mx: 10, px: 5}}>
            <h1> {data.title} </h1>
            <Grid container spacing={2} sx={{mx: 'auto'}} >
                <Grid item xs={8} sm={4} sx={{mx: 'auto', textAlign: "left", fontSize: 'large'}}>
                    {parse(data.summary)}<br/>
                    <h4>Ready in {data.readyInMinutes} minutes</h4>
                    <h5>Serves {data.servings} people</h5>
                </Grid>
                <Grid item sx={{mx: 'auto'}} xs={4} sm={6}>
                    <Grid container direction="row-reverse">
                        <img style={{width:"auto",  height:"auto"}} src={data.image} alt={data.title}/>
                    </Grid>
                </Grid>
                <Grid item xs={6} sx={{textAlign: "left"}}>
                    <h3>Ingredients</h3>
                    <ul>
                    {data.extendedIngredients.map((ingredient, index) => (
                        <li>{ingredient.original}</li>
                        ))}
                    </ul>
                    {isAuth() ?
                        <div>
                            <Button variant="contained" onClick={handleClick}>Add to list</Button>
                            <Popover id={recipe_id} open={menuOpen} anchorEl={anchorEl}
                                     anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                                     onClose={handleClose}>
                                <RecipeForm ingredients={data.extendedIngredients}
                                            recipe_name={data.title}
                                            url={data.id}/>
                            </Popover>
                        </div> :
                        <h6>You need to be logged in to add ingredients to your to-do list.</h6>}
                </Grid>
                <Grid item xs={6} sx={{textAlign: "left"}}>
                {data.analyzedInstructions ?
                    <div>
                        <h3>Instructions</h3>
                        {data.analyzedInstructions[0].steps.map((step, index) => (
                            <div>
                                <h3>Step {step.number}</h3>
                                <p>{step.step}</p><br/>
                            </div>
                        ))}
                    </div> : <div>
                        <h3>No instructions available!</h3>
                    </div>}
                </Grid>
                <Grid item xs={12} sx={{textAlign: "left"}}>
                    <Reviews recipe_id={recipe_id}/>
                </Grid>
            </Grid>
        </Box>)
    } else {
        return null;
    }
}

function RecipeForm({ingredients, recipe_name, id}){

    const [doSend, setDoSend] = useState(false);
    const [finalIng, setFinalIng] = useState([]);

    const allIngredientsList = [];
    ingredients.map((ing) => (allIngredientsList.push(ing.name)))

    const token = localStorage.getItem("token")

    const {isLoading, isError, isSuccess, data, error} = useQuery(["addIngredients", token, id], async () => {
        const response = await fetch("http://localhost:8000/create_tasks/",
            {
                method: "POST",
                body: JSON.stringify({
                    token: token,
                    url: window.location.href,
                    recipe_name: recipe_name,
                    ingredients: finalIng
                })
            })
        return response.json()
    }, {refetchOnWindowFocus: false, enabled: doSend})

    console.log(data)

    if(isSuccess){
        return (<h3>Tasks added!</h3>)
    } else if(isLoading){
        return (<h3>Adding tasks...</h3>)
    } else if(isError){
        return (<h3>Something wrong happened.</h3>)
    } else {
        return (<div>
            <h3>Add Ingredients to Todolist</h3>
            <Formik initialValues={{
                allIngredients: false,
                checked: []
            }} onSubmit={(values) => {
                if(values.allIngredients){
                    setFinalIng(allIngredientsList)
                } else {
                    setFinalIng(values.checked)
                }
                setDoSend(true)
            }}>
                {({values }) => (
                    <Form>
                        <label>
                            <Field type="checkbox" name="allIngredients"/>
                            Add All Ingredients
                        </label>
                        <br/><br/>
                        {values.allIngredients === true ? <div></div> : ingredients.map((ing) => (<div>
                            <label>
                                <Field type="checkbox" name="checked" value={ing.name}/>
                                {ing.name}
                            </label><br/>
                            </div>
                        ))}
                        <Button variant="contained" type="submit">Add to List</Button>
                    </Form>
                )}
            </Formik>
        </div>)
    }


}