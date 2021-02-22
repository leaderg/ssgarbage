import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import ProductModal from '../Components/ProductModal';

import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  TextField,
  Container,
  Button,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  Tab,
  Tabs,
InputLabel,
Select,
} from "@material-ui/core";

import {
  ExpandMore,
  Add,
  TableChart,
  Delete,
  Folder,
  Edit,
  Replay,
  Close,
  Ballot,
} from "@material-ui/icons";

const useStyles = makeStyles({
  container: {
    height: '80vh'
  }
})


class Inventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      products: [],
      selectedCategoryId: null,
      product: {
        name: "",
        sku: "",
        taxed: true,
        taxPercent: 0,
        loyaltyApplied: false,
        categoryId: null
      },
      showProductModal: false,
      showCreateProductModal:false,
      showCreateCategoryModal: false,
      showDeleteCategoryModal: false
    }
  }

  componentDidMount() {
    this.getCategories();
  }

  getCategories = () => {
    axios
      .get(`/api/categories`)
      .then(res => {
        const categories = res.data;
        this.setState({ categories, selectedCategoryId: null, showCreateCategoryModal: false, showDeleteCategoryModal: false });
      })
  }

  selectCategory(categoryId) {
    let product = {...this.state.product};
    product.categoryId = categoryId;
    axios
    .get(`/api/products/${categoryId}`)
    .then(res => {
      const selectedProducts = res.data;
      this.setState({
        products: selectedProducts,
        selectedCategoryId: categoryId,
        product,
        showProductModal: false,
        showCreateProductModal: false
      });
    })
  }

  resetProductList = () => {
    axios
    .get(`/api/products/${this.state.selectedCategoryId}`)
    .then(res => {
      const selectedProducts = res.data;
      this.setState({
        products: selectedProducts,
        showProductModal: false
      });
    })
  }

  newCategory = event => {
    this.setState({ newCategory: event.target.value });
  }

  newCategorySubmit = event => {
    event.preventDefault();
    const category = { name: this.state.newCategory };
    axios
    .post(`/api/categories`, { category })
    .then(res => {
      this.getCategories();
    })
  }

  deleteCategory = (categoryId) => {
    axios
    .delete(`/api/categories/${categoryId}`)
    .then(res => {
      this.getCategories();
    })
  }

  //=======================================
  //To be moved to component

  nameChange = event => {
    let product = {...this.state.product};
    product.name = event.target.value;
    this.setState({ product });
  }

  skuChange = event => {
    let product = {...this.state.product};
    product.sku = event.target.value;
    this.setState({ product });
  }

  toCents(input) {
    input *= 100
    return(input);
  }

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  priceChange = event => {
    let product = {...this.state.product};
    product.price = this.toCents(event.target.value);
    this.setState({ product });
  }

  taxIncludedInPrice = event => {
    this.setState({ incInPrice: event.target.checked });
  }

  taxPercentChange = event => {
    let product = {...this.state.product};
    product.taxPercent = event.target.value;
    this.setState({ product });
  }

  loyaltyAppliedChange = event => {
    let product = {...this.state.product};
    product.loyaltyApplied = event.target.checked;
    this.setState({ product });
  }

  handleSubmit = event => {
    let product = this.state.product
    if(this.state.incInPrice) {
      product.price /= ((product.taxPercent/100)+1)
    }
    axios.post(`/api/products`, { product })
      .then(res => {
        this.selectCategory(this.state.selectedCategoryId)
      })
  }

  deleteProduct = productId => {
    axios
    .delete(`/api/products/${productId}`)
    .then(res => {
      this.selectCategory(this.state.selectedCategoryId)
    })
  }

  openProductModal = (productId) => {
    axios
    .get(`/api/product/${productId}`)
    .then( res => {
      this.setState({
        selectedProduct: res.data[0],
        showProductModal: true
      })
    })
  }

  closeProductModal = () => {
    this.setState({showProductModal: false})
  }

  //================================================

  render() {
    const { categories, products, selectedCategoryId, showCreateProductModal, showCreateCategoryModal, showDeleteCategoryModal } = this.state;
    let createProductForm = (
      <form onSubmit={this.handleSubmit}>
        <label>
            Name:
            <input type="text" name="name" onChange={this.nameChange} />
          </label><br/><br/>
          <label>
            SKU:
            <input type="text" name="sku" onChange={this.skuChange} />
          </label><br/><br/>
          <label>
            Price:
            <input type="number" step="0.01" name="price" onChange={this.priceChange} />
          </label><br/><br/>
          <label>
            Tax Included In Price?:
            <input type="checkbox" name="taxed" onChange={this.taxIncludedInPrice} />
          </label><br/><br/>
          <label>
            Tax percentage:
            <input type="number" name="taxPercent" onChange={this.taxPercentChange} />
          </label><br/><br/>
      </form>
      )

    let createProductModal = (
      <Dialog
        open={showCreateProductModal}
        onClose={() => this.setState({showCreateProductModal: false})}
        fullWidth={true}
      >
        <DialogTitle id="simple-dialog-title">Create New Product</DialogTitle>
        <DialogContent>
          {createProductForm}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => this.setState({showCreateProductModal: false})}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={this.handleSubmit}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    )

    let createCategoryModal = (
      <Dialog
        open={showCreateCategoryModal}
        onClose={() => this.setState({showCreateCategoryModal: false})}
      >
        <DialogTitle id="simple-dialog-title">Create New Category</DialogTitle>
        <DialogContent>
          <input type="text" name="name" placeholder="Category Name" onChange={this.newCategory} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => this.setState({showCreateCategoryModal: false})}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={this.newCategorySubmit}>
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    )

    let deleteCategoryModal = (
      <Dialog
        open={showDeleteCategoryModal}
        onClose={() => this.setState({showDeleteCategoryModal: false})}
      >
        <DialogTitle id="simple-dialog-title">Delete Category</DialogTitle>
        <DialogContent>
          Delete Button Will IMMEDIATELY Delete Category.
          {categories.map((category) => { return(
                  <Accordion style={{width: "35vw"}}>
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                      {category.name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Button variant="contained" color="secondary" onClick={() => this.deleteCategory(category.id)}>
                        Delete Now
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                )})}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => this.setState({showDeleteCategoryModal: false})}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )

    return (
    <div className="App">
      <Typography variant="h3">Inventory</Typography>
        <Container>
          <Paper elevation={3} style={{height: '80vh'}}>
            <Grid container xs={12}>
              <Grid item xs={4} style={{borderRight: '2px solid lightgrey'}}>
              <CardHeader
              title={"Categories"}
              titleTypographyProps={{variant:'h4' }}
              avatar={<List />}
              action={
                <>
                <IconButton aria-label="Quotes" onClick={() => this.setState({ showDeleteCategoryModal: true})}>
                  <Edit />
                </IconButton>
                <IconButton aria-label="Quotes" onClick={() => this.setState({showCreateCategoryModal: true})}>
                  <Add />
                </IconButton>
                </>
            }/>
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  aria-label="Vertical tabs example"
                  style={{ height: '68vh', marginTop: '2vh' }}
                >
               {categories.map((category) => { return(
                  <Tab label={category.name} onClick={() => this.selectCategory(category.id)}/>
                )})}
                </Tabs>
              </Grid>
              <Grid item xs={8}>
                <CardHeader
                  title={"Products"}
                  titleTypographyProps={{variant:'h4' }}
                  avatar={<List />}
                  action={
                    <>
                    <IconButton aria-label="Quotes" onClick={() =>this.setState({showCreateProductModal: true})}>
                      <Add />
                    </IconButton>
                    </>
                }/>
                <TableContainer style={{maxHeight: '70vh'}}>
                <Table stickyHeader >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Product Name
                      </TableCell>
                      <TableCell>
                        SKU
                      </TableCell>
                      <TableCell>
                        Price
                      </TableCell>
                      <TableCell>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  {products.map((product, index) => {
                    return (
                      <TableRow hover key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{this.toDollars(product.price)}</TableCell>
                        <TableCell align="right">
                          <IconButton aria-label="Quotes" onClick={() => {this.openProductModal(product.id)}}>
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  }
                  <TableBody>
                  </TableBody>
                </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Container>
        {createProductModal}
        {createCategoryModal}
        {deleteCategoryModal}
        <ProductModal
          product={this.state.selectedProduct}
          deleteProduct={this.deleteProduct}
          reset={this.resetProductList}
          showProductModal={this.state.showProductModal}
          closeProductModal={this.closeProductModal}
        />


    </div>
    );
  }
}
export default Inventory;