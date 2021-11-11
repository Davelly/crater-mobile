import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import Roles from './list-roles';
import {ROLES_FORM} from 'stores/role/types';
import {rolesSelector} from 'stores/role/selectors';
import {commonSelector} from 'stores/common/selectors';

const mapStateToProps = state => ({
  roles: rolesSelector(state),
  ...commonSelector(state)
});

const RolesForm = reduxForm({form: ROLES_FORM})(Roles);

export const RolesContainer = connect(mapStateToProps)(RolesForm);
