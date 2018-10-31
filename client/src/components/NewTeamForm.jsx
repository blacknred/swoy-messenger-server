import React from 'react';
import PropTypes from 'prop-types';

import {
    Paper,
    Avatar,
    Button,
    TextField,
    Typography,
} from '@material-ui/core';
import People from '@material-ui/icons/People';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    layout: {
        width: 'auto',
        display: 'block', // Fix IE11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(350 + theme.spacing.unit * 3 * 2)]: {
            width: 350,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing.unit * 4,
    },
    avatar: {
        marginBottom: theme.spacing.unit * 3,
    },
    form: {
        marginTop: theme.spacing.unit * 2,
        width: '100%', // Fix IE11 issue.
        '& > div': {
            marginBottom: theme.spacing.unit * 3,
        },
    },
});

const NewTeamForm = ({
    classes, name, description, onChange, onSubmit,
    errors: { nameError, descriptionError },
}) => (
    <main className={classes.layout}>
        <Paper className={classes.paper}>
            <Avatar className={classes.avatar}>
                <People />
            </Avatar>
            <Typography variant="headline">Create a Team</Typography>
            <div className={classes.form}>
                <TextField
                    autoFocus
                    required
                    fullWidth
                    id="name"
                    name="name"
                    label="Team name"
                    autoComplete="name"
                    defaultValue={name}
                    error={!!nameError}
                    helperText={nameError}
                    onChange={onChange}
                />
                <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Team description"
                    defaultValue={description}
                    error={!!descriptionError}
                    helperText={descriptionError}
                    onChange={onChange}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={onSubmit}
                    children="Create Team"
                    disabled={name.length === 0}
                />
            </div>
        </Paper>
    </main>
);

NewTeamForm.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    errors: PropTypes.shape({
        nameError: PropTypes.string,
        descriptionError: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(NewTeamForm);
