import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import ProductModal from '../Components/ProductModal';


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
      showProductModal: false
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
        this.setState({ categories });
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
        showProductModal: false
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
    event.preventDefault();
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
    const { categories, products, selectedCategoryId } = this.state;
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
          {/*<label>
            Applies Loyalty:
            <input type="checkbox" name="loyaltyApplied" onChange={this.loyaltyAppliedChange} />
          </label><br/><br/>*/}
        <button type="submit">Add</button>
      </form>
      )

    return (
    <div className="App">
      <h1>Inventory</h1>
      <div className="inventory-category-div">
      <h2>Categories</h2>
      <div className="category-list">
                  {categories.length ? (
      <div>
                  {categories.map((category) => { return(
        <div className="category-card noselect" onClick={() => this.selectCategory(category.id)}>
          {category.name}
        </div>);})}
      </div>) : (
      <div>
        <h3>No Categories Found</h3>
      </div>)}
      <form className="category-card" onSubmit={this.newCategorySubmit}>
        <label>
          Add Category<br/>
          <input type="text" name="name" placeholder="Category Name" onChange={this.newCategory} />
          <button type="submit">Add</button>
        </label>
      </form>
      </div>
      </div>
      <div className="inventory-product-div">
      <h2>Products</h2>
                {selectedCategoryId === null ? (
      <div className="product-list">
        <h3>Please Select a Category</h3>
      </div>
                  ) : (products.length ? (
        <div className="product-list">
                  {products.map((product) => { return(
          <div className="product-card" onClick={() => this.openProductModal(product.id)}>
            {product.name}
          </div> )})}
        <h2>Add a Product</h2>
        {createProductForm}
      </div> ) : (
      <div className="product-list">
        <h3>No Products found for this category</h3>
        <h2>Add a Product</h2>
        {createProductForm}
      </div>))}
      </div>
      <ProductModal
        product={this.state.selectedProduct}
        deleteProduct={this.deleteProduct}
        reset={this.resetProductList}
        showProductModal={this.state.showProductModal}
        closeProductModal={this.closeProductModal}/>
    </div>
    );
  }
}
export default Inventory;