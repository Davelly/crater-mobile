import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Input} from 'react-native-elements';
import debounce from 'lodash/debounce';
import styles from './styles';
import {IInputField} from './type';
import {AssetIcon} from '../AssetIcon';
import {colors} from '@/styles';
import {Text} from '../Text';
import {BaseLabel, BaseError} from '@/components';
import {commonSelector} from 'stores/common/selectors';
import {
  hasTextLength,
  hasValue,
  keyboardReturnKeyType,
  keyboardType
} from '@/constants';

export class InputFieldComponent extends Component<IInputField> {
  constructor(props) {
    super(props);

    this.state = {
      isSecureTextEntry: this.props.secureTextEntry,
      active: false,
      isOptionsVisible: false,
      inputVal: ''
    };
  }

  componentDidMount() {
    const {input, isDebounce} = this.props;

    this.initialValue(input?.value);
    this.onErrorCallback = debounce(this.onErrorCallback, 200);
    if (isDebounce) {
      this.onChangeValue = debounce(this.onChangeValue, 500);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps?.input?.value !== this.props.input?.value)
      this.initialValue(nextProps?.input?.value);
  }

  initialValue = value => {
    const {isCurrencyInput} = this.props;

    if (value && isCurrencyInput && this.isNumber(value)) {
      this.setState({inputVal: `${value / 100}`});
      return;
    }

    this.setState({inputVal: `${value}`});
  };

  toggleSecureTextEntry = () => {
    if (this.props.disabled) {
      return;
    }

    this.setState(({isSecureTextEntry}) => ({
      isSecureTextEntry: !isSecureTextEntry
    }));
  };

  isNumber = text => !isNaN(parseFloat(text)) && isFinite(text);

  getSign = () => {
    const {dollarField, percentageField} = this.props;

    if (dollarField) {
      return '$';
    }

    if (percentageField) {
      return '%';
    }

    return null;
  };

  onErrorCallback = error => {
    this.props.onError?.(hasValue(error));
  };

  toggleFocus = status => {
    this.setState({active: status});
  };

  onChangeValue = text => {
    this.props.onChangeText?.(text);
  };

  render() {
    const {
      input: {onChange, onFocus},
      hint,
      meta: {error, submitFailed},
      secureTextEntry,
      refLinkFn,
      inputContainerStyle,
      editable = true,
      hideError,
      autocomplete,
      options,
      disabled,
      textColor,
      height,
      setActivity,
      fieldStyle,
      containerStyle,
      leftIcon,
      leftIconSolid = false,
      textStyle,
      inputProps = {},
      rounded,
      isCurrencyInput = false,
      leftIconStyle,
      isRequired = false,
      secureTextIconContainerStyle,
      leftSymbol,
      onError,
      currency,
      theme,
      returnKeyType = keyboardReturnKeyType.NEXT,
      onSubmitEditing,
      placeholder
    } = this.props;

    const {isSecureTextEntry, active, isOptionsVisible, inputVal} = this.state;

    const sign = this.getSign();
    const isOptions = autocomplete && isOptionsVisible && !!options.length;

    !hideError && onError && this.onErrorCallback(error);

    let leftIconSymbol = {};
    if (leftIcon) {
      leftIconSymbol = {
        leftIcon: (
          <AssetIcon
            name={leftIcon}
            solid={leftIconSolid}
            size={18}
            color={colors.darkGray}
          />
        ),
        leftIconContainerStyle: [
          styles.leftIcon,
          leftIconStyle && leftIconStyle
        ]
      };
    }
    if (isCurrencyInput && currency?.symbol) {
      leftIconSymbol = {
        leftIcon: (
          <View style={styles.leftSymbolView}>
            <Text
              color={
                active || hasTextLength(inputVal)
                  ? theme?.text?.secondaryColor
                  : theme?.text?.fifthColor
              }
              style={styles.leftSymbol}
            >
              {currency.symbol}
            </Text>
          </View>
        )
      };
    }
    if (leftSymbol) {
      leftIconSymbol = {
        leftIcon: (
          <View style={styles.leftSymbolView}>
            <Text
              color={
                active || hasTextLength(inputVal)
                  ? theme?.text?.secondaryColor
                  : theme?.text?.fifthColor
              }
              style={styles.leftSymbol}
            >
              {leftSymbol}
            </Text>
          </View>
        )
      };
    }

    let methods: any = {
      onFocus: event => {
        this.toggleFocus(true);
        this.setState({isOptionsVisible: true});
        setActivity?.(true);
        onFocus?.(event);
      },
      ...(!inputProps?.multiline && {
        blurOnSubmit: inputProps?.onSubmitEditing ? false : true
      }),
      ...(!inputProps?.multiline && {
        onEndEditing: () => this.toggleFocus(false)
      }),
      ...(inputProps?.multiline && {
        onBlur: () => this.toggleFocus(false)
      })
    };

    return (
      <View style={[styles.inputFieldWrapper, fieldStyle && {...fieldStyle}]}>
        <BaseLabel isRequired={isRequired}>{hint}</BaseLabel>
        <Input
          containerStyle={[
            containerStyle && containerStyle,
            styles.containerStyle
          ]}
          {...leftIconSymbol}
          inputStyle={[
            styles.input(theme),
            {
              color: theme?.input?.color
            },
            leftSymbol && styles.withLeftSymbolText,
            active && styles.activeInput,
            textColor && {color: textColor},
            textStyle && textStyle,
            height && {height},
            inputProps?.multiline && styles.multilineField
          ]}
          inputContainerStyle={[
            styles.inputContainerStyle,
            {
              backgroundColor: theme?.input?.backgroundColor,
              borderColor: theme?.input?.borderColor
            },
            secureTextEntry && styles.inputPassword,
            inputContainerStyle && inputContainerStyle,
            rounded && {borderRadius: 5},
            disabled && styles.disabledInput(theme),
            submitFailed &&
              error && {
                borderColor: theme?.input?.validationBackgroundColor
              }
          ]}
          returnKeyType={returnKeyType}
          onSubmitEditing={e => onSubmitEditing?.(e.nativeEvent.text)}
          placeholder={placeholder}
          keyboardType={this.props.keyboardType ?? keyboardType.DEFAULT}
          {...inputProps}
          {...methods}
          onChangeText={enteredValue => {
            this.setState({inputVal: enteredValue});
            this.onChangeValue?.(enteredValue);

            isCurrencyInput && this.isNumber(enteredValue)
              ? onChange(Math.round(enteredValue * 100))
              : onChange(enteredValue);
          }}
          defaultValue={`${inputVal}`}
          secureTextEntry={isSecureTextEntry}
          ref={ref => refLinkFn?.(ref)}
          placeholderTextColor={theme?.input?.placeholderColor}
          editable={editable && !disabled}
          allowFontScaling={false}
          textAlignVertical={inputProps && inputProps?.multiline && 'top'}
          {...(theme?.mode === 'dark' && {
            selectionColor: theme?.text?.primaryColor
          })}
        />
        {sign && (
          <Text positionAbsolute style={styles.signField} opacity={0.6}>
            {sign}
          </Text>
        )}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={this.toggleSecureTextEntry}
            style={[
              styles.icon,
              secureTextIconContainerStyle && secureTextIconContainerStyle
            ]}
            hitSlop={{
              top: 13,
              left: 13,
              bottom: 13,
              right: 13
            }}
          >
            <AssetIcon
              name={isSecureTextEntry ? 'eye' : 'eye-slash'}
              size={18}
              color={theme?.icons?.eye?.color}
            />
          </TouchableOpacity>
        )}

        <BaseError {...this.props} />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currency: state.common?.currency,
  ...commonSelector(state)
});

export const InputField = connect(mapStateToProps)(InputFieldComponent);
