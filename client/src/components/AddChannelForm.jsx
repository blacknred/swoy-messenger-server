import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import {
    Switch,
    Dialog,
    Button,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';

const styles = theme => ({
    form: {
        marginTop: theme.spacing.unit * 2,
        width: '100%', // Fix IE11 issue.
    },
});

const AddChannelForm = ({
    classes, width, open, channelName, nameError, isPublic,
    onChange, onSubmit, onClose,
}) => (
    <Dialog
        open={open}
        fullScreen={isWidthDown('sm', width)}
        onClose={() => onClose('isAddChannelModalOpen')}
    >
        <DialogTitle>Add new channel</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                required
                fullWidth
                id="channelName"
                name="channelName"
                label="Channel name"
                autoComplete="name"
                className={classes.form}
                defaultValue={channelName}
                error={!!nameError}
                helperText={nameError}
                onChange={onChange}
            />
            <FormControlLabel
                control={(
                    <Switch
                        checked={isPublic}
                        name="isPublic"
                        onChange={onChange}
                        value={(!isPublic).toString()}
                    />
                )}
                label="Make channel public"
            />
        </DialogContent>
        <DialogActions>
            <Button
                onClick={() => onClose('isAddChannelModalOpen')}
                children="Cansel"
            />
            <Button
                type="submit"
                variant="raised"
                color="primary"
                className={classes.submit}
                onClick={onSubmit}
                children="Create Team"
                disabled={channelName.length === 0}
            />
        </DialogActions>
    </Dialog>
);

AddChannelForm.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    width: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    channelName: PropTypes.string.isRequired,
    nameError: PropTypes.string.isRequired,
    isPublic: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default compose(withStyles(styles), withWidth())(AddChannelForm);