import React, { Component } from 'react';
import { View, Text, Dimensions, Platform, TouchableOpacity, Image, AsyncStorage } from 'react-native';
var { height, width } = Dimensions.get('window');
import NewsListItem from './NewsListItem';
import { loadListData, selectedPost0, selectedPost1, selectedPost2, addRecent } from '../actions';
import { connect } from 'react-redux';

class NewsList extends Component {
  constructor(props) {
    super(props)
  }
  toDetail(postId) {
    let listRecent = this.props.listRecent
    if (listRecent.length < 30) {
      listRecent.unshift(this.props.listData[postId])
    }
    else {
      listRecent.pop();
      listRecent.unshift(this.props.listData[postId])
    }
    AsyncStorage.setItem('listRecent', JSON.stringify(listRecent))
    this.props.dispatch(selectedPost0(postId))
    this.props.dispatch(selectedPost1(postId + 1))
    this.props.dispatch(selectedPost2(postId - 1))
    this.props.navigation.navigate('Detail_Screen')
  }
  render() {
    var source = [];
    for (var i = 0; i < 3; i++) {
      if (this.props.data[i].url.includes("vnexpress")) {
        source[i] = "Vnexpress.net";
      } else {
        source[i] = "Tinmoi24.vn"
      }
    }
    if (this.props.data) {
      return (
        <View style={[{ height: height, backgroundColor: this.props.postBackground }, this.props.style]}>
          <View style={styles.menuBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { this.props.navigation.navigate('DrawerOpen') }}>
                <Image source={require('../../img/ic_list_w.png')} style={{ height: 24, width: 24, marginLeft: 15, tintColor: this.props.textColor }} />
              </TouchableOpacity>
              <Text style={{ textAlign: 'center', fontSize: 20, marginLeft: 20, color: this.props.textColor, fontWeight: 'bold' }}>TEANEWS</Text>
            </View>
            <TouchableOpacity onPress={() => { this.props.navigation.navigate('Search_Screen') }}>
              <Image source={require('../../img/ic_search_b.png')} style={{ height: 24, width: 24, tintColor: this.props.textColor }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => this.toDetail(this.props.dataIndex)}
            style={{ width: width - 20, height: width - 40, margin: 10 }}>
            <View style={{ flex: 1 }}>
              <Image
                resizeMode="cover"
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                source={{ uri: this.props.data[0].thumb }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                <View style={{ paddingLeft: 10, paddingBottom: 10 }}>
                  <View style={[styles.category, { backgroundColor: this.props.data[0].cateColor }]}>
                    <Text style={styles.categoryText}>{this.props.data[0].cate}
                    </Text>
                  </View>
                  {/*<Text style={styles.categoryText}>{this.props.data[0].source}
                  </Text>*/}
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{this.props.data[0].title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={{ color: 'rgb(221, 221, 221)', fontSize: 13, marginBottom: 10 }}>{this.props.data[0].des}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View style={{ width: width - 20, height: height / 2 - 90, margin: 10, marginTop: 0, flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => this.toDetail(this.props.dataIndex + 1)}
              style={{ flex: 1, marginRight: 5 }}>
              <View style={{ backgroundColor: this.props.data[1].cateColor, flex: 1, justifyContent: 'space-between', padding: 10 }}>
                <View style={[styles.category, { backgroundColor: this.props.data[1].cateColor, borderColor: 'white', borderWidth: 1 }]}>
                  <Text style={styles.categoryText}>{this.props.data[1].cate}
                  </Text>
                </View>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }} numberOfLines={5} ellipsizeMode="tail">{this.props.data[1].title}
                </Text>
                {/*<Text style={styles.categoryText}>{this.props.data[1].source}
                </Text>*/}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.toDetail(this.props.dataIndex + 2)}
              style={{ flex: 1, marginLeft: 5, backgroundColor: 'yellow' }}>
              <View style={{ flex: 1 }}>
                <Image
                  resizeMode="cover"
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                  source={{ uri: this.props.data[2].thumb }} />
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1, justifyContent: 'space-between', padding: 10 }}>
                  <View style={[styles.category, { borderColor: 'white', borderWidth: 1 }]}>
                    <Text style={styles.categoryText}>{this.props.data[2].cate}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={5}
                    ellipsizeMode="tail"
                    style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{this.props.data[2].title}
                  </Text>
                  {/*<Text style={styles.categoryText}>{this.props.data[2].source}
                  </Text>*/}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else { return <View></View> }
  }
}
// this.props.dataIndex+index
const mapStateToProps = state => {
  return {
    postBackground: state.readerModalReducer.postBackground,
    textColor: state.readerModalReducer.textColor,
    listData: state.loadListDataReducer.list,
    listRecent: state.bookmarkReducer.listRecent
  }
}
const styles = {
  category: {
    borderRadius: 5,
    marginBottom: 10,
    width: 80,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
    borderRadius: 4
  },
  menuBar: {
    marginTop: 30,
    height: 30,
    width: width,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20
  },
}
export default connect(mapStateToProps)(NewsList);
