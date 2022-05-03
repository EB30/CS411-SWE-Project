import './App.css';
import React, {Component, useState} from "react";
import {useQuery, useQueryClient} from "react-query";
import {Box, Button, TextField, Stack, Divider, Pagination} from "@mui/material";
import {Link} from 'react-router-dom';
import {ReactQueryDevtools} from "react-query/devtools";

/**
 * App - The default page, where users can search for a recipe
 * Once the user generates a query, the Recipe function will regenerate the queries, if used.
 */

class App extends Component{
    render() {
        return (
            <Searcher/>
        );
    }
}

class Searcher extends Component {

    constructor(props) {
        super(props);
        this.state = {query: '', clippedSearch: '', pageNum: 1}
    }

    onChange = (ev) => {
        this.setState({ query: ev.target.value })
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ clippedSearch: this.state.query, pageNum: 1 })
    }

    render(){
        return (
          <div style={{alignItems: "center"}}>
              <form onSubmit={this.onSubmit}>
                  <Box justifyContent="center" sx={{display: "flex", mx: 'auto', p: 2, width: "75%"}} autocomplete="off">
                          {/*<h1>Search</h1>*/}
                          <TextField id="outlined-basic" sx={{ width: "25%", input: {color: 'white'}}}
                                     InputLabelProps={{ style: {color: 'white'}}}
                                     name="query" label="Search for Recipes..." variant="outlined"
                                     value={this.state.query} onChange={this.onChange}/>

                          <Button variant="contained" size='large' type="submit">Search</Button>
                  </Box>
              </form>
              <ReactQueryDevtools initialIsOpen={false} />
              <Recipe query={this.state.clippedSearch} pageNum={this.state.pageNum}/>
          </div>
        );
    }
}

/**
 * Recipe
 * @param query -- The recipe to search for
 * @param pageNum -- Recipe page number request
 * @returns {JSX.Element|null} -- either a list of matched recipe ideas, or no recipes (no results found)
 * @constructor
 */

function Recipe({query}){

    const client = useQueryClient()
    const [pageNum, setPageNum] = useState(1)

    const { isLoading, isError, data, error } = useQuery(['searchRecipes', query, pageNum], async () => {
        if(query === ""){
            return {};
        } const response = await fetch("http://localhost:8000/search/" + query.replace(/ /g, '_') + "/" + pageNum.toString())
               if (!response.ok) {
                   return {};
               }
               return response.json()
            }, {refetchOnWindowFocus: false}
        )

    if (query && query.length < 3){
        return null;
    }

    // console.log(query)
    // console.log(data)
    if(isLoading) {
        return <div><h3>Loading...</h3></div>
    } if (isError) {
        return <div><h3>Error! {error}</h3></div>
    } if(data && data.status && data.status !== 200) {
        return <div><h3>Error! Spoonacular API returned error.</h3></div>
    } if(data && data.results) {
        if (data.totalResults === 0){
            return (<div>
                <h4>No recipes found! Try searching again.</h4>
            </div>)
        } else {
            return (
                <div>
                    {data.results.map((recipe, index) => (
                        <div key={index}>
                            <Box sx={{display: "flex", mx: 'auto', pt: 2, width: "75%"}}>
                                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" color="white" flexItem/>}>
                                    {/* TODO: get rid of that stupid lower part because of the stupid image that exists! */}
                                    <img style={{width: 'auto', maxHeight: '50%'}} src={recipe.image}/>
                                    <h2>{recipe.title}</h2>
                                    <Button component={Link} to={"/recipe/" + recipe.id} variant="contained" color="primary">Go to Recipe</Button>
                                </Stack>
                            </Box>
                        </div>
                    ))}
                    <Box sx={{display: "flex", mx: 'auto', mb: 5, p: 2, width: "75%", alignItems: "center", justifyContent: "center space-between"}}>
                        <Pagination count={Math.floor(data.totalResults / 10) + 1} sx={{color: "white"}} color="primary" page={pageNum}
                                    onChange={(event, page) => setPageNum(page)}/>
                    </Box>
                </div>)
        }
    } else {
        return null;
    }
}

export default App;
