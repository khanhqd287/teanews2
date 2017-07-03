import React, { Component } from 'react';
import {
  View, Text, Dimensions, Platform, TouchableOpacity, Image,
  TouchableHighlight,
  TextInput,
  WebView,
  Share,
  Linking,
  Clipboard,
  ScrollView,
  AsyncStorage,
  Alert,
  Switch,
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
var { height, width } = Dimensions.get('window');

import _ from 'lodash';
import { RunsItem, Button1 } from '../common';
const cheerio = require('cheerio-without-node-native');
import * as Animatable from 'react-native-animatable';
var Toast = require('react-native-toast');

// import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { connect } from 'react-redux';
import {
  changeFontSize, changeModalState, changeBackgroundColor,
  changeTextColor, changeNightMode, changeLoadingState, changeLineHeight
} from '../actions';
var WEBVIEW_REF = 'webview';
import FitImage from 'react-native-fit-image';
import HTMLView from './react-native-htmlview';

class NewsItem extends Component {
  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
  }
  state = {
    html: '',
    openMenu: false,
    bookMark: [],
    bodyHTML: '',
    headHTML: '',
    isSaved: false,
    textSelected: '',
    loading: true,
    videoUrl: null,
    list: [],
    switcher: false,
    fontSize: 14,
    sourceReal: '',
    source: '',
    arr: [],
    logo: '',
    reRender: false,
    height: '',
    width: ''
  };
  componentWillMount() {
    if (this.props.row) {
      this.fetchContent(this.props.row)
    }
  }
  componentWillReceiveProps(props) {
    if ((props.row != this.props.row) && (props.row)) {
      this.setState({ loading: true, reRender: true }, () => { this.fetchContent(this.props.row) })
    }
  }
  _share() {
    Share.share({
      message: this.props.row.title,
      url: this.props.row.url,
      title: 'From News App'
    }, {
        dialogTitle: 'From News App',
        // excludedActivityTypes: [
        //   'com.apple.UIKit.activity.PostToTwitter'
        // ],
        tintColor: 'green'
      })
      .then(this._showResult)
      .catch((error) => this.setState({ result: 'error: ' + error.message }));
  }
  _showResult(result) {
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        this.setState({ result: 'shared with an activityType: ' + result.activityType });
      } else {
        this.setState({ result: 'shared' });
      }
      alert(this.state.result)
    } else if (result.action === Share.dismissedAction) {
      this.setState({ result: 'dismissed' });
      alert(this.state.result)
    }
  }
  _openLink() {
    Linking.canOpenURL(this.props.row.url).then(supported => {
      if (supported) {
        Linking.openURL(this.props.row.url);
      } else {
        console.log('Don\'t know how to open URI: ' + this.props.row.url);
      }
    });
  }
  bodau(source) {
    source = source.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ằ|Ẵ/g, "A");
    source = source.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    source = source.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    source = source.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    source = source.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    source = source.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    source = source.replace(/Đ/g, "D");
    source = source.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ằ|ẵ/g, "a");
    source = source.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    source = source.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    source = source.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    source = source.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    source = source.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    source = source.replace(/đ/g, "d");
    source = source.replace(/\s+/g, "");
    return source;
  }
  fetchContent(row) {
    this.props.dispatch(changeLoadingState(true))
    let sourceReal;
    this.setState({ loading: true, reRender: false });
    setTimeout(() => this.setState({ loading: false }), 4000);
    let url = row.url
    let other = []
    fetch(url)
      .then((response) => response.text())
      .then((responseData) => {
        $ = cheerio.load(responseData);
        $("a").parent(".Normal").remove();
        $("em").parent(".Normal").remove();
        $("em,i,span,a, strong").replaceWith(function () { return $(this).contents(); });
        //$("strong").replaceWith(function () { return `<p style="font-Size:18">${$(this).contents()}</p>` });
        $("[data-component-type=video]").replaceWith("<strong>Bài viết chứa video, vui lòng mở link bằng trình duyệt để xem video</strong>");
        $("video").replaceWith("<strong>Bài viết chứa video, vui lòng mở link bằng trình duyệt để xem video</strong>");
        // $(".see-now,.author_mail.width_common,.tbl_insert,.VCSortableInPreviewMode,.image,iframe,.block_filter_live,.detail_top_live.width_common,.block_breakumb_left,#menu-box,.bi-related,head,#result_other_news,#social_like,noscript,#myvne_taskbar,.block_more_info,#wrapper_header,#header_web,#wrapper_footer,.breakumb_timer.width_common,.banner_980x60,.right,#box_comment,.nativeade,#box_tinkhac_detail,#box_tinlienquan,.block_tag.width_common.space_bottom_20,#ads_endpage,.block_timer_share,.title_news,.div-fbook.width_common.title_div_fbook,.xemthem_new_ver.width_common,.relative_new,#topbar,#topbar-scroll,.text_xemthem,#box_col_left,.form-control.change_gmt,.tt_2,.back_tt,.box_tinkhac.width_common,#sticky_info_st,.col_fillter.box_sticky_left,.start.have_cap2,.cap2,.list_news_dot_3x3,.minutes,#live-updates-wrapper,.block_share.right,.block_goithutoasoan,.xemthem_new_ver.width_common,meta,link,.menu_main,.top_3,.number_bgs,.filter_right,#headmass,.box_category.width_common,.banner_468.width_common,.adsbyeclick,.block_col_160.right,#ArticleBanner2,#ad_wrapper_protection,#WIDGET").remove();
        let text = $(".newbody p").last().text()
        if (text.includes(">>> Đọc thêm")) {
          $(".newbody p").last().remove();
        }
        this.setState({
          bodyHTML: $('.newbody').html(),
          sourceReal: sourceReal
        }, () => {
          this.setState({ loading: false }, () => this.updateWebview(row))

        })

      })
  }
  updateWebview(row) {
    this.props.dispatch(changeLoadingState(false))
    let source = this.props.row.source
    switch (source) {
      case 'VnExpress': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/VnExpress.png`),
          height: 20,
          width: 20
        })
        break;
      }
      case '24h': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/24h.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Báo mới': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/Baomoi.png`),
          height: 20,
          width: 20
        })
        break;
      }
      case 'Thể thao 247': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/thethao247.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Bóng đá 24h': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/Bongda24h.png`),
          height: 40,
          width: 60
        })
        break;
      }

      case 'Bóng đá Plus': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/BongdaPlus.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Dân Việt': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/DanViet.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Người Đưa Tin': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/NguoiDuaTin.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Tiền Phong': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/tienphong.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Thể thao văn hóa': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/thethaovanhoa.png`),
          height: 30,
          width: 60
        })
        break;
      }
      case 'Báo An ninh': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/anninhthudo.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Báo Lao Động': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/laodong.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Afamily': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/afamily.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Dân trí': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/dantri.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Người Lao Động': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/laodong.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Phunutoday': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/phunutoday.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'InfoNet': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/infonet.jpg`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Kiến thức': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/kienthuc.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Một thế giới': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/motthegioi.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Báo đất Việt': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/baodatviet.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Blog Tâm sự': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/blogtamsu.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Ngôi Sao': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/ngoisaologo.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Vietnamnet': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/vietnamnet.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'SaoStar': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/saostar.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Vtc News': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/vtc.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Báo Tuổi Trẻ': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/tuoitre.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Pháp Luật Plus': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/phapluatplus.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Báo Giao thông': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/BaoGiaothong.png`),
          height: 40,
          width: 60
        })
        break;
      }
      case 'Kênh 14': {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/logo/kenh14.png`),
          height: 40,
          width: 60
        })
        break;
      }
      default: {
        this.setState({
          source: source,
          loading: false,
          logo: require(`../../img/tinmoi24h.png`),
          height: 20,
          width: 20
        })
        break;
      }
    }
  }
  loading() {
    if (this.state.loading) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 4, backgroundColor: this.props.postBackground, width: width, height: height }}>
          <ActivityIndicator size="large" />
        </View>
      )
    }
  }

  onScroll = (e) => {
    var scrollHeight = e.nativeEvent.contentOffset.y + height - 50;
    var contentHeight = e.nativeEvent.contentSize.height;
    var num = scrollHeight - contentHeight;
    if (contentHeight > height) {
      this.setState({ pullToCloseDist: num })
      if (num <= 10) {
        this.setState({ pullToCloseColor: "white" })
      } else if ((num > 10) && (num < 100)) {
        this.setState({ pullToCloseColor: "rgba(0,0,0,0." + Math.floor(num) + ")" })
      } else {
        this.setState({ pullToCloseColor: "black" })
      }
    } else {
      this.setState({ pullToCloseDist: e.nativeEvent.contentOffset.y - 20 })
    }
  }
  switcherPressed() {
    if (this.props.postBackground == 'white') {
      this.props.dispatch(changeTextColor('white'));
      this.props.dispatch(changeBackgroundColor('black'));
      this.props.dispatch(changeNightMode(true));
    } else {
      this.props.dispatch(changeTextColor('black'));
      this.props.dispatch(changeBackgroundColor('white'));
      this.props.dispatch(changeNightMode(false));
    }
    setTimeout(() => { this.fetchContent(this.props.row) }, 100)
  }
  render() {
    const styles2 = {
      h1: {
        fontSize: this.props.fontSize,
        color: this.props.textColor,
      },
      h2: {
        fontSize: this.props.fontSize,
        fontWeight: '500',
        color: this.props.textColor,
      },
      h3: {
        fontWeight: '400',
        fontSize: this.props.fontSize,
        color: this.props.textColor,
      },
      p: {
        fontSize: this.props.fontSize,
        color: this.props.textColor,
        lineHeight: this.props.lineHeight,

      },
      td: {
        fontSize: 15,
        color: this.props.textColor,
        lineHeight: this.props.lineHeight
      },
      strong: {
        color: this.props.textColor,
        fontSize: this.props.fontSize,
        fontWeight: '600',
        lineHeight: this.props.lineHeight
      },
      ul: {
        padding: 0,
      },
      span: {
        fontSize: this.props.fontSize,
        color: this.props.textColor,
        lineHeight: this.props.lineHeight
      },
      i: {
        fontSize: this.props.fontSize,
        color: this.props.textColor,
        lineHeight: this.props.lineHeight
      },
      div: {
        fontSize: this.props.fontSize,
        color: this.props.textColor,
        lineHeight: this.props.lineHeight
      },
    };
    let date = new Date(this.props.row.date);
    let time = isNaN(date) ? this.props.row.date : date.toLocaleDateString();
    return (
      <View>
        <View style={{ height: 20, width: width, backgroundColor: 'black' }}>
        </View>
        {this.props.openMenu &&
          <TouchableOpacity style={styles.modalContainer} onPress={() => this.props.dispatch(changeModalState(!this.props.openMenu))}>
            <Animatable.View animation="slideInUp" duration={300} style={[styles.menuModal, { backgroundColor: this.props.postBackground }]}>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <TouchableHighlight
                  underlayColor="white"
                  onPress={() => {
                    if (this.props.fontSize > 7) {
                      this.props.dispatch(changeFontSize(this.props.fontSize - 2));
                      this.props.dispatch(changeLineHeight(this.props.lineHeight - 2));
                      setTimeout(() => { this.fetchContent(this.props.row) }, 100)
                    } else {
                      Toast.show('Cỡ chữ đã thu nhỏ tối đa');
                    }
                    if (Platform.OS === 'android') {
                      setTimeout(() => this.reloadWebview(), 200)
                    }
                  }}
                  style={[styles.modalItem, { borderRightWidth: 1, borderTopLeftRadius: 10 }]}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: this.props.textColor }}>A</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="white"
                  onPress={() => {
                    if (this.props.fontSize < 30) {
                      this.props.dispatch(changeFontSize(this.props.fontSize + 2));
                      this.props.dispatch(changeLineHeight(this.props.lineHeight + 2));
                      setTimeout(() => { this.fetchContent(this.props.row) }, 100)
                    } else {
                      Toast.show('Cỡ chữ đã tăng tối đa');
                    }
                    if (Platform.OS === 'android') {
                      setTimeout(() => this.reloadWebview(), 200)
                    }
                  }}
                  style={[styles.modalItem, { borderTopRightRadius: 10 }]}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: this.props.textColor }}>A</Text>
                  </View>
                </TouchableHighlight>

              </View>
              <TouchableHighlight
                underlayColor="white"
                onPress={() => this.switcherPressed()}
                style={styles.modalItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                  <Text style={[styles.modalText, { color: this.props.textColor }]}>Chế độ đọc ban đêm
                          </Text>
                  <Switch
                    value={this.props.nightMode}
                    onValueChange={() => {
                      this.switcherPressed();
                    }} />
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="white"
                onPress={() => this._openLink()}
                style={styles.modalItem}>
                <View>
                  <Text style={[styles.modalText, { color: this.props.textColor }]}>Mở trong trình duyệt
                          </Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  Clipboard.setString(this.props.row.url);
                  Toast.show('Đã sao chép link');
                  this.props.dispatch(changeModalState(!this.props.openMenu))
                }}
                style={[styles.modalItem, { borderBottomWidth: 0 }]}
              >
                <View>
                  <Text style={[styles.modalText, { color: this.props.textColor }]}>Sao chép link
                          </Text>
                </View>
              </TouchableHighlight>

            </Animatable.View>
          </TouchableOpacity>
        }
        {this.loading()}

        {!this.state.reRender &&
          <ScrollView
            onScroll={this.onScroll}
            scrollEventThrottle={30}
            onTouchEnd={() => {
              if (this.state.pullToCloseDist > 90) {
                this.props.navigation.goBack();
              }
            }}
            style={{ width: width, height: height - 50, backgroundColor: this.props.postBackground, marginBottom: 50 }}
          >
            <View style={styles.sourceContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {(this.state.logo != '') &&
                  <Image resizeMode='center' source={this.state.logo} style={{ height: 30, width: 30 }} />
                }
                <Text style={{ textAlign: 'center', marginLeft: 10, fontSize: 13, color: '#9b9b9b' }}>{this.state.source}</Text>
              </View>
              <Text style={{ marginRight: 20, textAlign: 'center', color: '#9b9b9b' }}>{time}</Text>
            </View>
            <Text style={{ fontFamily: 'Lora-Regular', margin: 10, marginLeft: 15, color: this.props.textColor, fontSize: 30, fontWeight: 'bold', marginTop: 0 }}>{this.props.row.title}</Text>
            <View style={[styles.cateContainer, { backgroundColor: this.props.row.cateColor }]}>
              <Text style={styles.textCate}>{this.props.row.cate}</Text>
            </View>

            <HTMLView
              value={this.state.bodyHTML}
              stylesheet={styles2}
            />

            <View style={{ width: 100, height: 40, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
              <Text style={{ color: this.state.pullToCloseColor }}> Pull To Close
              </Text>
            </View>

          </ScrollView>
        }
      </View>

    )
  }
}
// function renderNode(node, index, siblings, parent, defaultRenderer) {
//   if (node.name == 'figure') {
//     const a = node.attribs["data-video-src"];
//     console.log(a)
//     return (
//       <View key={index} style={{width: width, height: 300}}>
//         <Video source={{uri: a}}   // Can be a URL or a local file.
//          ref={(ref) => {
//            this.player = ref
//          }}                                      // Store reference
//          rate={1.0}                              // 0 is paused, 1 is normal.
//          muted={false}
//          paused={false}
//          resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
//          repeat={true}                           // Repeat forever.
//          playInBackground={false}                // Audio continues to play when app entering background.
//          playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
//          style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             bottom: 0,
//             right: 0,
//           }} />
//       </View>
//     );
//   }
// }
const styles = {
  cateContainer: {
    marginLeft: 15,
    borderRadius: 3,
    width: 70,
    marginBottom: 10,
  },
  textCate: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    margin: 5,
    borderRadius: 4,
  },
  sourceContainer: {
    marginTop: 10,
    marginLeft: 15,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cover: {
    justifyContent: 'center',
    height: 200,
    width: width
  },
  content: {
    justifyContent: 'flex-start',
    padding: 10,
    width: width
  },
  title: {
    fontWeight: '500',
    fontSize: 15,
    marginRight: 10
  },
  date: {
    fontSize: 13,
    color: 'grey'
  },
  info1: {
    flexDirection: 'row'
  },
  shareModal: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        zIndex: 3,
      },
      android: {
        borderColor: 'rgb(217, 217, 217)',
        borderLeftWidth: 1,
        zIndex: 4
      }
    }),
    bottom: 0,
    elevation: 5,
    shadowOpacity: 0.3,
    width: '100%'
  },
  modalItem: {
    borderColor: 'rgb(217, 217, 217)',
    borderBottomWidth: 1,
    justifyContent: 'center',
    flex: 1
  },
  modalText: {
    paddingLeft: 20
  },
  menuModal: {
    elevation: 5,
    shadowOpacity: 0.3,
    height: 200,
    width: width,
    borderColor: 'white',
    borderWidth: 1
  },
  modalContainer: {
    width: width,
    height: height,
    position: 'absolute',
    zIndex: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.39)',
    justifyContent: 'flex-end',
    paddingBottom: 55,
    alignItems: 'center'
  }
}

const mapStateToProps = state => {
  return {
    openMenu: state.readerModalReducer.modalState,
    fontSize: state.readerModalReducer.fontSize,
    postBackground: state.readerModalReducer.postBackground,
    textColor: state.readerModalReducer.textColor,
    disableScroll: state.readerModalReducer.disableScroll,
    nightMode: state.readerModalReducer.nightMode,
    menuBarColor: state.readerModalReducer.menuBarColor,
    lineHeight: state.readerModalReducer.lineHeight
  }
}
export default connect(mapStateToProps)(NewsItem);
