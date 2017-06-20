import React, {Component, PropTypes} from 'react';
import htmlToElement from './htmlToElement';
import {
  Linking,
  StyleSheet,
  View,
} from 'react-native';

import { connect } from 'react-redux';

const boldStyle = {fontWeight: '500', marginLeft: 10};
const italicStyle = {fontStyle: 'italic', marginLeft: 10};
const codeStyle = {fontFamily: 'Menlo'};

const baseStyles = StyleSheet.create({
  b: boldStyle,
  strong: boldStyle,
  i: italicStyle,
  em: italicStyle,
  pre: codeStyle,
  code: codeStyle,
  a: {
    fontWeight: '500',
    color: '#007AFF',
  },
  h1: {fontWeight: '500', fontSize: 36, marginLeft: 10},
  h2: {fontWeight: '500', fontSize: 30, marginLeft: 10},
  h3: {fontWeight: '500', fontSize: 24, marginLeft: 10},
  h4: {fontWeight: '500', fontSize: 18, marginLeft: 10},
  h5: {fontWeight: '500', fontSize: 14, marginLeft: 10},
  h6: {fontWeight: '500', fontSize: 12, marginLeft: 10},
});

class HtmlView extends Component {
  constructor() {
    super();
    this.state = {
      element: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.startHtmlRender(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.startHtmlRender(nextProps.value);
    }
    if (this.props.stylesheet !== nextProps.stylesheet) {
      this.startHtmlRender(nextProps.value);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  startHtmlRender(value) {
    if (!value) {
      this.setState({element: null});
    }

    const opts = {
      addLineBreaks: this.props.addLineBreaks,
      linkHandler: this.props.onLinkPress,
      styles: Object.assign({}, baseStyles, this.props.stylesheet),
      customRenderer: this.props.renderNode,
    };

    htmlToElement(value, opts, (err, element) => {
      if (err) {
        this.props.onError(err);
      }

      if (this.mounted) {
        this.setState({element});
      }
    });
  }

  render() {
    if (this.state.element) {
      return <View children={this.state.element} style={this.props.style} />;
    }
    return <View style={this.props.style} />;
  }
}

HtmlView.propTypes = {
  addLineBreaks: PropTypes.bool,
  value: PropTypes.string,
  stylesheet: PropTypes.object,
  style: View.propTypes.style,
  onLinkPress: PropTypes.func,
  onError: PropTypes.func,
  renderNode: PropTypes.func,
  blockComponent: PropTypes.func,
  inlineComponent: PropTypes.func,
};

HtmlView.defaultProps = {
  addLineBreaks: true,
  onLinkPress: url => Linking.openURL(url),
  onError: console.error.bind(console),
};

const mapStateToProps = state => {
  return {
    fontSize: state.readerModalReducer.fontSize,
    textColor: state.readerModalReducer.textColor,
  }
}
export default connect(mapStateToProps)(HtmlView);