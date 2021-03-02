import React, { useState } from "react";
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';

import {
  Button,
  TextField,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core"

import { NoteAdd, Send, Close } from "@material-ui/icons"

//Date Frameworks
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";


//Material UI Styling
const useStyles = makeStyles((theme) => ({
  buttom: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(7),
    backgroundColor: '#01a2de'
  }
}));

//React Functional Component with React Hooks

function NoteModal() {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("")

  const handleInput = (e) => {
    setNote(e.target.value)
  }

  const submit = () => {
    axios
    .post('/api/addNote', { note: note })
    .then( res => {
      setOpen(false)
      alert('Note Created.')
    })
  }

  return (
    <>
    <Fab className={classes.buttom} color="primary" onClick={() => setOpen(true)}>
      <NoteAdd/>
    </Fab>
    <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth={true}
      >
        <DialogTitle id="simple-dialog-title">
          Add A Note To Reports
        </DialogTitle>
        <DialogContent>
          <TextField
          margin="dense"
          fullWidth
          onChange={(e) => handleInput(e)}
          placeholder={"Add Note"}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="Primary" onClick={() => submit()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      </>
  );
}

export default NoteModal;