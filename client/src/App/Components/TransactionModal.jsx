import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
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
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  IconButton,
  ListItem,
  ListItemText,
  FormControl,
InputLabel,
Select,
} from "@material-ui/core";

import {
  ExpandMore,
  TableChart,
  Edit,
  List,
  Replay,
  Close,
  Ballot,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  dialog: {
    padding: 0,
    margin: 0
  },
  cardContent: {
    overflow: 'scroll'
  },
  footer: {
    position: 'sticky',
  bottom: 0
  }
}));

export default function TransactionModal() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editOpen, setEditModal] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false)
  };

  const toggleEdit = () => {
    editMode ? (
    setEditMode(false)
      ) : (
    setEditMode(true))
  }

  const handleEditOpen = () => {
    setEditModal(true);
  }

  const handleEditCose = () => {
    setEditModal(false)
  }

  const displayModal =
    <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        className={classes.dialog}
      >
      {/*<DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>*/}
      <DialogContent className={classes.dialog} >
      <Card>
            <CardHeader
              title={"Order #121313"}
              avatar={<List />}
              action={
                <>
                <IconButton onClick={toggleEdit} aria-label="Quotes">
                  <Edit />
                </IconButton>
                <IconButton onClick={handleClose} aria-label="Quotes">
                  <Close />
                </IconButton>
                </>
            }/>
             <Divider/>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                <ListItem>
                    <ListItemText primary={"Customer"} secondary={"Company busines"}/>
                  </ListItem>
                </Grid>
                <Grid item xs={6}>
                  <ListItem>
                    <ListItemText primary={"Date"} secondary={"02/12/24"}/>
                  </ListItem>
                </Grid>
                <Grid item xs={12}>
                  <Table className={classes.table} aria-label="spanning table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" colSpan={3}>
                          Details
                        </TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Desc</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Sum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                        <TableRow>
                          <TableCell>Catfood</TableCell>
                          <TableCell align="right">3</TableCell>
                          <TableCell align="right">2</TableCell>
                          <TableCell align="right">$3.14</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={6} />
                        <TableCell colSpan={2}>Subtotal</TableCell>
                        <TableCell align="right">3.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Discount</TableCell>
                        <TableCell align="right">$1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        <TableCell align="right">$4</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell align="right">$6.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Mastercard</TableCell>
                        <TableCell align="right">-$6.14</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </CardContent>
        </Card>
        </DialogContent>
      </Dialog>

  const editModal =
     <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
      >
      <DialogContent className={classes.dialog}>
          <Card >
            <CardHeader
              title={"Order #121313 - Editing"}
              avatar={<List />}
              action={
                <>
                <IconButton onClick={toggleEdit} aria-label="Quotes">
                  <Edit />
                </IconButton>
                <IconButton onClick={handleClose} aria-label="Quotes">
                  <Close />
                </IconButton>
                </>
            }/>
           <Divider/>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                <ListItem>
                    <ListItemText primary={"Customer"} secondary={"Company busines"}/>
                  </ListItem>
                </Grid>
                <Grid item xs={6}>
                  <ListItem>
                    <ListItemText primary={"Date"} secondary={"02/12/24"}/>
                  </ListItem>
                </Grid>
                <Grid item xs={12}>

                  <Table className={classes.table} aria-label="spanning table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" colSpan={3}>
                          Details
                        </TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Desc</TableCell>
                        <TableCell align="right">Qty.</TableCell>
                        <TableCell align="right">Unit</TableCell>
                        <TableCell align="right">Sum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                          <TableCell>Catfood</TableCell>
                          <TableCell align="right">

                            <TextField
                              label="3"
                              variant="filled"
                            />

                          </TableCell>
                          <TableCell align="right">2</TableCell>
                          <TableCell align="right">$3.14</TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                      Add Product
                    </AccordionSummary>
                    <AccordionDetails>
                      <Button variant="contained" color="primary" className={classes.button}>
                        Add
                      </Button>
                    </AccordionDetails>
                  </Accordion>

                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={6} />
                        <TableCell colSpan={2}>Subtotal</TableCell>
                        <TableCell align="right">3.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Discount</TableCell>
                        <TableCell align="right">$1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        <TableCell align="right">$4</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell align="right">$6.14</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>

                        <FormControl variant="filled">
                        <InputLabel htmlFor="filled-age-native-simple">Mastercard</InputLabel>
                        <Select
                          native
                          value={"Payment"}
                          onChange={null}
                        >
                          <option aria-label="None" value="" />
                          <option value={10}>Cash</option>
                          <option value={20}>Debit</option>
                          <option value={30}>Credit</option>
                        </Select>
                        </FormControl>

                        </TableCell>
                        <TableCell align="right">-$

                        <TextField
                          label="6.14"
                          variant="filled"
                        />

                        </TableCell>
                      </TableRow>
                      <TableRow>
                    </TableRow>
                    </TableBody>
                  </Table>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                      Add Payment
                    </AccordionSummary>
                    <AccordionDetails>
                      <Button variant="contained" color="primary" className={classes.button}>
                        Add
                      </Button>
                    </AccordionDetails>
                  </Accordion>

                </Grid>
              </Grid>
            </CardContent>
          </Card>
      </DialogContent>
                <DialogActions>
                  <Button variant="contained" color="secondary" className={classes.button}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" className={classes.button}>
                    Save
                  </Button>
                </DialogActions>
      </Dialog>


  return (
    <div>
      <button type="button" onClick={handleOpen}>
        Open Modal
      </button>
      {editMode ? editModal : displayModal}
    </div>
  );
}