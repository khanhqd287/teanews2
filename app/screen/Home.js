import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  PanResponder,
  Animated,
  AsyncStorage,
  StatusBar
} from 'react-native';
var { height, width } = Dimensions.get('window');
import { Button1 } from '../common';
import NewsItem2 from '../common/NewsItem2';
import NewsList from '../common/NewsList';
const cheerio = require('cheerio-without-node-native');

import { loadListData, selectedPost0, selectedPost1, selectedPost2, replaceBookmark, replaceRecent, addRecent } from '../actions';
import { connect } from 'react-redux';
import { replaceListCate, reload, addSearchKeyword } from '../actions';

import { firebaseApp } from '../app';
const numberOfItem = 3;

class Home extends Component {
  static navigationOptions = {
    title: 'Tea News',
    headerTitleStyle: { alignSelf: 'center' }
  }
  constructor(props) {
    super(props);
    topView = null;
    paddingTop = 0;
    this.state = {
      data: [],
      top0: new Animated.Value(0),
      top1: new Animated.Value(0),
      top2: new Animated.Value(-height),
      index0: 2,
      index1: 1,
      index2: 3,
      dataSlot0: 0,
      dataSlot1: 1,
      dataSlot2: -1,
      dy: 0,
      listCate: [],
      loading: true,
      bigData: [],
      listRecent: []
    }
    topViewStyle = {
      style: {
        top: paddingTop
      }
    }

    firebaseApp.database().ref("search").child("keyword").on('child_added', (data) => {
      this.props.dispatch(addSearchKeyword(data.val().key))
    })

    this._get('listCate');
    this._get('listBookmark');
    this._get("listRecent");
  }
  _updateStyle() {
    topView && topView.setNativeProps(topViewStyle)
  }
  _get = async (key) => {
    try {
      var value = await AsyncStorage.getItem(key);
      if (value !== null) {
        switch (key) {
          case 'listBookmark':
            this.props.dispatch(replaceBookmark(JSON.parse(value)))
            break;
          case 'listRecent':
            this.props.dispatch(replaceRecent(JSON.parse(value)));
            this.setState({
              listRecent: JSON.parse(value)
            })
            break;
          case 'listCate':
            this.props.dispatch(replaceListCate(JSON.parse(value)))
            this.setState({ listCate: JSON.parse(value) }, () => {
              let listCate = this.state.listCate;
              if (listCate.length > 0) {
                let newObj = {};
                for (var i = 0; i < listCate.length; i++) {
                  newObj["data" + i] = []
                }
                this.setState({ ...newObj }, () => {
                  let arrPromise = listCate.map((val, index) => {
                    return new Promise((resolve, reject) => {
                      this.fetchData(val.link, val.name, val.color, index, resolve)
                    })
                  })
                  Promise.all(arrPromise).then(() => {
                    this.arrangeData()
                  })
                })
              } else {
                this.fetchData('http://vnexpress.net/rss/kinh-doanh.rss')
              }
            })
            break;
        }
      }
    } catch (error) { alert(error) }
  };
  arrangeData() {
    let listCate = this.state.listCate;
    var bigData = [];
    function compare(a, b) {
      if (a.date < b.date)
        return 1;
      if (a.date > b.date)
        return -1;
      return 0;
    }
    for (var i = 0; i < listCate.length; i++) {
      for (var n = 0; n < this.state["data" + i].length; n++) {
        bigData.push(this.state["data" + i][n]);
      }
      this.setState({ bigData: bigData.sort(compare), loading: false }, () => {
        this.props.dispatch(loadListData(this.state.bigData))
      })
    }
  }
  componentWillReceiveProps(props) {
    if (props.reload) {
      this._get('listCate')
      this.setState({
        top0: new Animated.Value(0),
        top1: new Animated.Value(0),
        top2: new Animated.Value(-height),
        index0: 2,
        index1: 1,
        index2: 3,
        dataSlot0: 0,
        dataSlot1: 1,
        dataSlot2: -1
      })
      this.props.dispatch(reload(false))
    }
  }
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      // onMoveShouldSetPanResponder: (event, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return gestureState.dx != 0 && gestureState.dy != 0;
      },
      onPanResponderGrant: (event, gestureState) => true,
      onPanResponderMove: (event, gestureState) => {
        switch (this.state.index0) {
          case 2:
            if (gestureState.dy > 0) {
              if (this.state.dataSlot0 > 0) {
                this.state.top2.setValue(-height + gestureState.dy)
              }
            } else {
              if (this.state.dataSlot0 + 1 < this.state.bigData.length) {
                this.state.top0.setValue(gestureState.dy)
              }
            }
            break;
          case 3:
            if (gestureState.dy > 0) {
              this.state.top0.setValue(-height + gestureState.dy)
            } else {
              if (this.state.dataSlot0 + numberOfItem + 1 < this.state.bigData.length) {
                this.state.top1.setValue(gestureState.dy)
              }
            }
            break;
          case 1:
            if (gestureState.dy > 0) {
              this.state.top1.setValue(-height + gestureState.dy)
            } else {
              if (this.state.dataSlot0 < this.state.bigData.length) {
                this.state.top2.setValue(gestureState.dy)
              }
            }
            break;
        }
        this.setState({ dy: gestureState.dy })
      },
      onPanResponderRelease: (event, gestureState) => {
        const axisDistance = height;
        const movedDistance = gestureState.moveY;
        const defaultVelocity = axisDistance / 800;
        const gestureVelocity = gestureState.vy;
        const velocity = Math.max(gestureVelocity, defaultVelocity);
        const resetDuration = movedDistance / velocity;
        const nextPageDuration = (axisDistance - movedDistance) / velocity;

        switch (this.state.index0) {
          case 2:
            if (this.state.dy > 0) {
              if ((this.state.dy > height / 4) || (gestureState.vy > 0.5)) {
                if (this.state.dataSlot0 > 0) {
                  this.setState({ index2: 2, index1: 3, index0: 1 }, () => {
                    if (this.state.dataSlot1 > numberOfItem + 1) {
                      this.setState({ dataSlot1: this.state.dataSlot1 - numberOfItem - 2 })
                    }
                  })
                  Animated.timing(
                    this.state.top2,
                    { toValue: 0, duration: nextPageDuration, useNativeDriver: true }
                  ).start();
                  this.state.top1.setValue(-height)
                }
              } else {
                Animated.timing(
                  this.state.top2,
                  { toValue: -height, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            } else {
              if ((this.state.dy < -height / 4) || (gestureState.vy < -0.5)) {
                if (this.state.dataSlot0 + 1 < this.state.bigData.length) {
                  this.setState({ index2: 1, index1: 2, index0: 3 }, () => {
                    this.setState({ dataSlot2: this.state.dataSlot2 + numberOfItem + 2 })
                  })
                  Animated.timing(
                    this.state.top0,
                    { toValue: -height, duration: nextPageDuration, useNativeDriver: true }
                  ).start();
                  this.state.top2.setValue(0)
                }
              } else {
                Animated.timing(
                  this.state.top0,
                  { toValue: 0, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            }
            break;
          case 3:
            if (this.state.dy > 0) {
              if ((this.state.dy > height / 4) || (gestureState.vy > 0.5)) {
                this.setState({ index0: 2, index2: 3, index1: 1 }, () => {
                  if (this.state.dataSlot2 > numberOfItem + 1) {
                    this.setState({ dataSlot2: this.state.dataSlot2 - numberOfItem - 2 })
                  }
                })
                Animated.timing(
                  this.state.top0,
                  { toValue: 0, duration: nextPageDuration, useNativeDriver: true }
                ).start();
                this.state.top2.setValue(-height)
              } else {
                Animated.timing(
                  this.state.top0,
                  { toValue: -height, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            } else {
              if ((this.state.dy < -height / 4) || (gestureState.vy < -0.5)) {
                if (this.state.dataSlot0 + numberOfItem + 1 < this.state.bigData.length) {
                  this.setState({ index0: 1, index2: 2, index1: 3 }, () => {
                    this.setState({ dataSlot0: this.state.dataSlot0 + numberOfItem + 2 })
                  })
                  Animated.timing(
                    this.state.top1,
                    { toValue: -height, duration: nextPageDuration, useNativeDriver: true }
                  ).start();
                  this.state.top0.setValue(0)
                }
              } else {
                Animated.timing(
                  this.state.top1,
                  { toValue: 0, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            }
            break;
          case 1:
            if (this.state.dy > 0) {
              if ((this.state.dy > height / 4) || (gestureState.vy > 0.5)) {
                this.setState({ index1: 2, index0: 3, index2: 1 }, () => {
                  if (this.state.dataSlot0 > numberOfItem + 1) {
                    this.setState({ dataSlot0: this.state.dataSlot0 - numberOfItem - 2 })
                  }
                })
                Animated.timing(
                  this.state.top1,
                  { toValue: 0, duration: nextPageDuration, useNativeDriver: true }
                ).start();
                this.state.top0.setValue(-height)
              } else {
                Animated.timing(
                  this.state.top1,
                  { toValue: -height, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            } else {
              if ((this.state.dy < -height / 3) || (gestureState.vy < -0.5)) {
                if (this.state.dataSlot0 < this.state.bigData.length) {
                  this.setState({ index1: 1, index0: 2, index2: 3 }, () => {
                    this.setState({ dataSlot1: this.state.dataSlot1 + numberOfItem + 2 })
                  })
                  Animated.timing(
                    this.state.top2,
                    { toValue: -height, duration: nextPageDuration, useNativeDriver: true }
                  ).start();
                  this.state.top1.setValue(0)
                }
              } else {
                Animated.timing(
                  this.state.top2,
                  { toValue: 0, duration: resetDuration, useNativeDriver: true }
                ).start();
              }
            }
            break;
          default:

        }

        // if ((0 > this.state["top"+this.state.itemIndex%3]._value)&&(this.state["top"+this.state.itemIndex%3]._value < -height/3)) {
        //   Animated.timing(
        //     this.state["top"+this.state.itemIndex%3],
        //     {toValue: -height, duration: 300}
        //   ).start();
        // } else {
        //   Animated.timing(
        //     this.state.top3,
        //     {toValue: 0, duration: 300}
        //   ).start();
        // }
      }
    });
  }
  componentDidMount() {
    setTimeout(() => {
      if (this.props.listCate.length == 0) {
        this.props.navigation.navigate('Category_Screen')
      }
    }, 200)
  }
  fetchData(linkRSS, cate, cateColor, i, callback) {
    let data = this.state["data" + i]
    if (linkRSS.includes('http://vnexpress.net/')) {
      fetch(linkRSS)
        .then((response) => response.text())
        .then((responseData) => {
          $ = cheerio.load(responseData, {
            xmlMode: true,
            decodeEntities: true
          })
          $('channel>item').each(function () {
            CDATA = $(this).find('description').text()
            let vitribatdau = CDATA.search('src=')
            let vitriketthuc = CDATA.search(' ></a>')
            let vitribatdauDes = CDATA.search('</br>')
            let vitriketthucDes = CDATA.search(']]>')
            let url = $(this).find('link').text()
            if ((url.includes('http://vnexpress.net/projects') == false) && (url.includes('http://vnexpress.net/infographics') == false)
              && (CDATA.includes('No Description') == false) && (url.includes('/tu-van/') == false) &&
              (url.includes('/hoi-dap/') == false) && (url.includes('http://vnexpress.net/interactive') == false) && (url.includes('http://video.vnexpress.net/') == false)) {
              data.push({
                title: $(this).find('title').text(),
                thumb: CDATA.slice(vitribatdau + 5, vitriketthuc - 1).replace("_180x108", ""),
                des: CDATA.slice(vitribatdauDes + 5, vitriketthucDes),
                url: url,
                date: new Date($(this).find('pubDate').text()).getTime(),
                cate: cate,
                cateColor: cateColor,
              })
              //console.log(data)
            }
          })
          this.setState({
            ['data' + i]: data,
            refreshing: false,
          }, () => callback())
        })
    }
    else {
      fetch(linkRSS)
        .then((response) => response.text())
        .then((responseData) => {
          $ = cheerio.load(responseData, {
            xmlMode: true,
            decodeEntities: true
          })
          $('.list-remain-category >article').each(function () {
            let thumb = $(this).find('figure').find('a img').attr('src').replace(/\s+ /g, "").replace(/(\r\n|\n|\r)/gm, "")
            let title = $(this).find('.title-full').attr('title').toString().replace(/\s+ /g, "").replace(/(\r\n|\n|\r)/gm, "")
            let summary = $(this).find('.summary').text().toString().replace(/\s+ /g, "").replace(/(\r\n|\n|\r)/gm, "")
            let date = $(this).find('.time').text().toString().replace(/\s+ /g, "").replace(/(\r\n|\n|\r)/gm, "")
            let decodeDate = $.parseHTML(date);
            let decodeTitle = $.parseHTML(title);
            let decodeSummary = $.parseHTML(summary);
            let time = decodeDate[0].data
            let minutes = time.slice(0, 2)
            let convertMinutesToMiliSe = parseInt(minutes) * 60 * 1000
            let now = new Date().getTime()
            let newsTime = now - convertMinutesToMiliSe
            if (decodeSummary !== null) {
              data.push({
                title: decodeTitle[0].data,
                thumb: thumb,
                des: decodeSummary[0].data,
                url: $(this).find('figure').find('a').attr('href').replace(/\s+ /g, ""),
                date: newsTime,
                cate: cate,
                cateColor: cateColor,

              })
            }
          })
          this.setState({
            ['data' + i]: data,
            refreshing: false,
          }, () => callback())
        })
    }
  }
  toDetail(postId, data) {
    let listRecent = this.state.listRecent;
    if (listRecent.length < 30) {
      listRecent.unshift(data)
    }
    else {
      listRecent.pop();
      listRecent.unshift(data)
    }
    this.props.dispatch(addRecent(data));
    AsyncStorage.setItem('listRecent', JSON.stringify(listRecent))
    this.props.dispatch(selectedPost0(postId))
    if (postId + 1 < this.state.bigData.length) {
      this.props.dispatch(selectedPost1(postId + 1))
    }
    if (postId + 2 < this.state.bigData.length) {
      this.props.dispatch(selectedPost2(postId + 2))
    }
    setTimeout(() => { this.props.navigation.navigate('Detail_Screen') }, 100)
  }
  renderLoading() {
    if (this.props.listCate.length == 0) {
      return (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => { this.props.navigation.navigate('Category_Screen') }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}><Text>   Hãy chọn Category --></Text></View>
        </TouchableOpacity>
      )
    } else {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, width: width, height: height }}><Text>Loading...</Text></View>
      )
    }
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.postBackground }}>
        {/*<View style={styles.navBarContainer}>
          <Image
            style={{ width: 25, height: 25, marginLeft: 20, tintColor: this.props.textColor }}
            source={require('../../img/navicon_menu.png')} />
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ListNewsOffline_Screen')}>
            <View style={{ marginRight: 20, height: 30, width: 100, alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text>

              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Category_Screen')}>
            <View style={{ marginRight: 20, height: 30, width: 100, alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'transparent' }}>
              <Text style={{ color: this.props.textColor }}>
                Chọn Cate
                </Text>
            </View>
          </TouchableOpacity>
        </View>*/}
        <StatusBar
          barStyle="light-content"
        />
        <View style={{ height: 20, width: width, backgroundColor: 'black', position: 'absolute', zIndex: 5}}>
        </View>
        {!this.state.loading ?
          <View {...this._panResponder.panHandlers}>

            <Animated.View
              style={{ position: 'absolute', top: this.state.top0, zIndex: this.state.index0, backgroundColor: (this.state.index0 == 1) ? 'rgba(232, 232, 232, 0.43)' : 'white' }}
            >
              <NewsItem2
                navigation={this.props.navigation}
                onPress={() => this.toDetail(this.state.dataSlot0, this.state.bigData[this.state.dataSlot0])}
                data={this.state.bigData[this.state.dataSlot0]} />
            </Animated.View>

            <Animated.View
              style={{ position: 'absolute', top: this.state.top1, zIndex: this.state.index1, backgroundColor: (this.state.index1 == 1) ? 'rgba(232, 232, 232, 0.43)' : 'white' }}
            >
              <NewsList
                navigation={this.props.navigation}
                data={this.state.bigData.slice(this.state.dataSlot1, this.state.dataSlot1 + numberOfItem)}
                dataIndex={this.state.dataSlot1} />
            </Animated.View>

            <Animated.View
              style={{ position: 'absolute', top: this.state.top2, zIndex: this.state.index2, backgroundColor: (this.state.index2 == 1) ? 'rgba(232, 232, 232, 0.43)' : 'white' }}
            >
              <NewsItem2
                navigation={this.props.navigation}
                onPress={() => this.toDetail(this.state.dataSlot2, this.state.bigData[this.state.dataSlot2])}
                data={this.state.bigData[this.state.dataSlot2]} />
            </Animated.View>
          </View>
          :
          this.renderLoading()}

      </View>
    );
  }
}
const styles = StyleSheet.create({
  menuBar: {
    height: 40,
    width: width,
    flexDirection: 'row',
    backgroundColor: 'blue',
    position: 'absolute',
    top: 20,
    left: 20
  }
})
const mapStateToProps = state => {
  return {
    listCate: state.listCateReducer.list,
    reload: state.listCateReducer.reload,
    postBackground: state.readerModalReducer.postBackground,
    textColor: state.readerModalReducer.textColor,
  }
}
export default connect(mapStateToProps)(Home);
