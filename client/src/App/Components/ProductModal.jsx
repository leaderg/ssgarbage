import React, { Component } from 'react';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button
} from "@material-ui/core";

class ProductModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      editView: false
    }
  }
  showModal() {
    this.setState({
      openModal: true
    })
  }

  hideModal() {
    this.setState({
      openModal: false
    })
  }

  activateEditView() {
    this.setState({
      editView: true
    })
  }

  toCents(input) {
    input *= 100
    return(input);
  }

  toDollars(input) {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  nameChange = event => {
    let editProduct = {...this.state.editProduct};
    if(!event.target.value) {
      delete editProduct.name
      this.setState({ editProduct })
      return;
    }
    editProduct.name = event.target.value
    this.setState({ editProduct });
  }

  skuChange = event => {
    let editProduct = {...this.state.editProduct};
    if(!event.target.value) {
      delete editProduct.sku
      this.setState({ editProduct })
      return;
    }
    editProduct.sku = event.target.value
    this.setState({ editProduct });
  }

  priceChange = event => {
    let editProduct = {...this.state.editProduct};
    if(!event.target.value) {
      delete editProduct.price
      this.setState({ editProduct })
      return;
    }
    editProduct.price = this.toCents(event.target.value)
    this.setState({ editProduct });
  }

  submitEdit = (productId) => {
    let product = this.state.editProduct
    axios
    .post(`/api/product/${productId}`, { product })
    .then(x => {
      this.setState({editView: false})
      this.props.reset()
    })
  }


  render() {

    let infoView = (
      <div>
        <h1>Product</h1>
          <div className="edit-employee-section">
            <div className="edit-employee-card">
              <div className="edit-employee-label">Name<br/>{this.props.product.name}</div>
            </div>
            <div className="edit-employee-card">
              <div className="edit-employee-label">SKU<br/>{this.props.product.sku}</div>
            </div>
            <div className="edit-employee-card">
              <div className="edit-employee-label">Price<br/>${this.toDollars(this.props.product.price)}</div>
            </div>
            <div className="edit-employee-card"></div>
          </div>
          <div className="edit-employee-btn-section">
            <div className="edit-employee-save-btn noselect" onClick={() => this.activateEditView()}>Edit Product</div>
          </div>
      </div>
    )

    let editView = (
      <div>
        <h1>Edit Product</h1>
          <div className="edit-employee-section">
          <div className="edit-employee-card">
            <div className="edit-employee-label">Name</div>
            <input
            className="edit-employee-value"
            onChange={this.nameChange}
            placeholder={this.props.product.name}/>
          </div>
          <div className="edit-employee-card">
            <div className="edit-employee-label">SKU</div>
            <input
            className="edit-employee-value"
            onChange={this.skuChange}
            placeholder={this.props.product.sku}/>
          </div>
          <div className="edit-employee-card">
            <div className="edit-employee-label">Price</div>
            $<input
            type="number"
            className="edit-employee-value"
            onChange={this.priceChange}
            placeholder={this.toDollars(this.props.product.price)}/>
          </div>
          <div className="edit-employee-card"></div>
          </div>
          <div className="edit-employee-btn-section">
            <div className="edit-employee-delete-btn noselect" onClick={() => this.props.deleteProduct(this.props.product.id)}>Delete Product</div>
            <div className="edit-employee-save-btn noselect" onClick={() => this.submitEdit(this.props.product.id)}>Save Changes</div>
          </div>
      </div>
    )

    let pModal = (
      <Dialog
        open={this.props.showProductModal}
        onClose={() => this.props.closeProductModal()}
        fullWidth={true}
      >
        <DialogTitle id="simple-dialog-title" style={{textAlign: "right"}}>
          <Button variant="contained" color="secondary" onClick={() => this.props.closeProductModal()}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent>
          {this.state.editView ? editView : infoView}
        </DialogContent>
        <DialogActions>

        </DialogActions>
      </Dialog>
      )


    return (
      this.props.showProductModal ? pModal : null
    )
  }
}
export default ProductModal;