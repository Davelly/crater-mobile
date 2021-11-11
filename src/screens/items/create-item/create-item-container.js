import {connect} from 'react-redux';
import {CreateItem} from './create-item';
import {reduxForm, getFormValues} from 'redux-form';
import {validate} from 'stores/items/validator';
import {CREATE_ITEM_FORM} from 'stores/items/types';
import {fetchItemUnits} from 'stores/item-unit/actions';
import {commonSelector, permissionSelector} from 'stores/common/selectors';
import {loadingSelector} from 'stores/items/selectors';
import {taxTypesSelector} from 'stores/tax-type/selectors';
import {fetchTaxes} from 'stores/tax-type/actions';
import {getSettingInfo} from '@/features/settings/actions';
import {unitsSelector} from 'stores/item-unit/selectors';
import {customFieldsSelector} from 'stores/custom-field/selectors';

const mapStateToProps = (state, {route}) => {
  const {invoices, estimates, recurringInvoices} = state;

  const item = route?.params?.item ?? {};
  const type = route?.params?.type;
  const screen = route?.params?.screen;
  const discountPerItem = route?.params?.discount_per_item;
  const taxPerItem = route?.params?.tax_per_item;

  return {
    loading:
      invoices?.isSaving || estimates?.isSaving || recurringInvoices?.isSaving,
    formValues: getFormValues(CREATE_ITEM_FORM)(state) || {},
    itemId: item && (item.item_id || item.id),
    taxTypes: taxTypesSelector(state),
    currency: route?.params?.currency,
    isItemScreen: screen === 'item',
    discountPerItem,
    taxPerItem,
    type,
    screen,
    units: unitsSelector(state),
    customFields: customFieldsSelector(state),
    ...permissionSelector(route),
    ...loadingSelector(state),
    ...commonSelector(state),
    initialValues: {
      price: null,
      quantity: 1,
      unit: null,
      unit_id: null,
      discount_type: 'none',
      discount: 0,
      taxes: [],
      ...item
    }
  };
};

const mapDispatchToProps = {
  fetchItemUnits,
  fetchTaxes,
  getSettingInfo
};

const createItemReduxForm = reduxForm({
  form: CREATE_ITEM_FORM,
  validate
})(CreateItem);

export const CreateItemContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(createItemReduxForm);
